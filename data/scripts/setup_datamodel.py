#!/usr/bin/env python3
"""
MWCP26 — Data model setup (idempotent)

Crée / met à jour les tables Conference, Salle, Session, SessionSpeaker
et leurs colonnes + lookups dans la solution mwcp26.

Le script est ré-exécutable sans risque : chaque objet est vérifié avant
création, et les display names / formats sont corrigés s'ils divergent du
modèle (voir data/model/conference-agenda.md).

Prérequis :
  - /dv-connect exécuté (data/scripts/auth.py + .env présents)
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from auth import get_client, get_token, load_env

load_env()

SOLUTION = "mwcp26"
LANG = 1036  # Français
DATAVERSE_URL = os.environ["DATAVERSE_URL"].rstrip("/")
API = f"{DATAVERSE_URL}/api/data/v9.2"

client = get_client("dv-metadata")

# Codes d'erreur transitoires (propagation metadata en cours)
TRANSIENT_CODES = ("0x80048550", "0x80040216", "0x80060891")


# ── Web API helpers ─────────────────────────────────────────────────────────────

def label(text, lang=LANG):
    return {
        "@odata.type": "Microsoft.Dynamics.CRM.Label",
        "LocalizedLabels": [{
            "@odata.type": "Microsoft.Dynamics.CRM.LocalizedLabel",
            "Label": text,
            "LanguageCode": lang,
        }],
    }


def _request(method, path, body=None, extra_headers=None):
    headers = {
        "Authorization": f"Bearer {get_token()}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
        headers["MSCRM.SolutionUniqueName"] = SOLUTION
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(f"{API}/{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req) as resp:
        raw = resp.read().decode()
        return resp.status, (json.loads(raw) if raw else None)


def _error_code(e):
    try:
        return json.loads(e.read().decode()).get("error", {}).get("code", "")
    except Exception:
        return ""


def get_json(path):
    """GET → dict, ou None si 404."""
    try:
        _, data = _request("GET", path)
        return data
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise


def post_metadata(path, body, what):
    """POST avec retry sur erreurs transitoires de propagation."""
    for attempt in range(4):
        try:
            status, _ = _request("POST", path, body)
            return status
        except urllib.error.HTTPError as e:
            code = _error_code(e)
            if any(c in code for c in TRANSIENT_CODES) and attempt < 3:
                print(f"    ⏳ propagation ({what}), retry {attempt + 1}/3 dans 15s...")
                time.sleep(15)
                continue
            detail = code or e.reason
            raise RuntimeError(f"POST {what} échoué ({e.code}/{detail})") from e


def put_metadata(path, body, what):
    """PUT (mise à jour) avec fusion des labels existants."""
    status, _ = _request("PUT", path, body, extra_headers={"MSCRM.MergeLabels": "true"})
    return status


# ── Métadonnées : lecture ────────────────────────────────────────────────────────

def get_attribute(table, column, cast=None):
    """Retourne l'attribut typé (avec cast) ou None s'il n'existe pas."""
    path = f"EntityDefinitions(LogicalName='{table}')/Attributes(LogicalName='{column}')"
    if cast:
        path += f"/{cast}"
    return get_json(path)


def label_text(meta):
    dn = (meta or {}).get("DisplayName") or {}
    for ll in dn.get("LocalizedLabels", []):
        if ll.get("LanguageCode") == LANG:
            return ll.get("Label")
    ull = dn.get("UserLocalizedLabel")
    return ull.get("Label") if ull else None


# ── Ensures : tables ─────────────────────────────────────────────────────────────

def ensure_table(schema_name, display_name, primary_column="mwcp26_Name"):
    if client.tables.get(schema_name):
        print(f"  ↩ table {schema_name}")
        return
    client.tables.create(schema_name, {}, solution=SOLUTION,
                         display_name=display_name, primary_column=primary_column)
    print(f"  ✓ table {schema_name} créée")


def ensure_session_speaker():
    """Table à clé primaire auto-number — Web API obligatoire."""
    if client.tables.get("mwcp26_sessionspeaker"):
        print("  ↩ table mwcp26_SessionSpeaker")
        return
    post_metadata("EntityDefinitions", {
        "@odata.type": "Microsoft.Dynamics.CRM.EntityMetadata",
        "SchemaName": "mwcp26_SessionSpeaker",
        "DisplayName": label("Intervenant de Session"),
        "DisplayCollectionName": label("Intervenants de Session"),
        "Description": label("Association entre une session et un intervenant"),
        "OwnershipType": "UserOwned",
        "HasActivities": False, "HasNotes": False, "IsActivity": False,
        "PrimaryNameAttribute": "mwcp26_code",
        "Attributes": [{
            "@odata.type": "Microsoft.Dynamics.CRM.StringAttributeMetadata",
            "SchemaName": "mwcp26_code",
            "DisplayName": label("Code"),
            "RequiredLevel": {"Value": "ApplicationRequired"},
            "MaxLength": 100, "IsPrimaryName": True,
            "AutoNumberFormat": "SPEAKER-{SEQNUM:5}",
        }],
    }, "table mwcp26_SessionSpeaker")
    print("  ✓ table mwcp26_SessionSpeaker créée (auto-number)")


# ── Ensures : display name (correction idempotente) ──────────────────────────────

def ensure_display_name(table, column, cast, desired):
    """Met le display name à `desired` si différent. Retourne True si modifié."""
    attr = get_attribute(table, column, cast)
    if attr is None:
        print(f"    ⚠ {column} introuvable pour correction du libellé")
        return False
    if label_text(attr) == desired:
        return False
    attr["DisplayName"] = label(desired)
    put_metadata(
        f"EntityDefinitions(LogicalName='{table}')/Attributes(LogicalName='{column}')/{cast}",
        attr, f"{column}.DisplayName",
    )
    print(f"  ✓ libellé {column} → « {desired} »")
    return True


# ── Ensures : colonnes ───────────────────────────────────────────────────────────

def ensure_datetime_column(table, column, display):
    cast = "Microsoft.Dynamics.CRM.DateTimeAttributeMetadata"
    attr = get_attribute(table, column, cast)
    if attr is None:
        post_metadata(
            f"EntityDefinitions(LogicalName='{table}')/Attributes",
            {
                "@odata.type": cast,
                "SchemaName": column,
                "DisplayName": label(display),
                "RequiredLevel": {"Value": "None"},
                "DateTimeBehavior": {"Value": "UserLocal"},
                "Format": "DateAndTime",
            },
            column,
        )
        print(f"  ✓ colonne {column} (DateTime) créée")
        return
    # existe : corriger Format + libellé si besoin
    needs_put = False
    if attr.get("Format") != "DateAndTime":
        attr["Format"] = "DateAndTime"; needs_put = True
    if label_text(attr) != display:
        attr["DisplayName"] = label(display); needs_put = True
    if (attr.get("DateTimeBehavior") or {}).get("Value") != "UserLocal":
        attr["DateTimeBehavior"] = {"Value": "UserLocal"}; needs_put = True
    if needs_put:
        put_metadata(
            f"EntityDefinitions(LogicalName='{table}')/Attributes(LogicalName='{column}')/{cast}",
            attr, column,
        )
        print(f"  ✓ colonne {column} corrigée (DateAndTime / « {display} »)")
    else:
        print(f"  ↩ colonne {column}")


def ensure_memo_column(table, column, display, max_length=2000):
    cast = "Microsoft.Dynamics.CRM.MemoAttributeMetadata"
    attr = get_attribute(table, column, cast)
    if attr is None:
        post_metadata(
            f"EntityDefinitions(LogicalName='{table}')/Attributes",
            {
                "@odata.type": cast,
                "SchemaName": column,
                "DisplayName": label(display),
                "Description": label("Description de la session"),
                "RequiredLevel": {"Value": "None"},
                "MaxLength": max_length, "Format": "Text",
            },
            column,
        )
        print(f"  ✓ colonne {column} (Memo) créée")
        return
    if label_text(attr) != display:
        attr["DisplayName"] = label(display)
        put_metadata(
            f"EntityDefinitions(LogicalName='{table}')/Attributes(LogicalName='{column}')/{cast}",
            attr, column,
        )
        print(f"  ✓ libellé {column} → « {display} »")
    else:
        print(f"  ↩ colonne {column}")


# ── Ensures : lookups ────────────────────────────────────────────────────────────

def ensure_lookup(referencing_table, lookup_field, referenced_table, display):
    logical = lookup_field.lower()
    if get_attribute(referencing_table, logical, "Microsoft.Dynamics.CRM.LookupAttributeMetadata"):
        print(f"  ↩ lookup {lookup_field}")
        return
    try:
        client.tables.create_lookup_field(
            referencing_table=referencing_table,
            lookup_field_name=lookup_field,
            referenced_table=referenced_table,
            display_name=display,
            solution=SOLUTION,
        )
        print(f"  ✓ lookup {lookup_field} ({referencing_table} → {referenced_table})")
    except Exception as e:
        if "already exists" in str(e).lower() or "0x80040237" in str(e):
            print(f"  ↩ lookup {lookup_field}")
        else:
            raise
    time.sleep(3)


# ── Publication ──────────────────────────────────────────────────────────────────

def publish_all():
    print("\n[4/4] Publication des customisations...")
    _request("POST", "PublishAllXml", body={})
    print("  ✓ publié")


# ══ Exécution ════════════════════════════════════════════════════════════════════

print("\n[1/4] Tables")
ensure_table("mwcp26_Conference", "Conférence")
ensure_table("mwcp26_Salle", "Salle")
ensure_table("mwcp26_Session", "Session")
ensure_session_speaker()

print("\n  ⏳ propagation tables (15s)...")
time.sleep(15)

print("\n[2/4] Colonnes")
# Primary names alignés sur le modèle (Conference/Salle = Nom, Session = Titre)
ensure_display_name("mwcp26_conference", "mwcp26_name", "Microsoft.Dynamics.CRM.StringAttributeMetadata", "Nom")
ensure_display_name("mwcp26_salle", "mwcp26_name", "Microsoft.Dynamics.CRM.StringAttributeMetadata", "Nom")
ensure_display_name("mwcp26_session", "mwcp26_name", "Microsoft.Dynamics.CRM.StringAttributeMetadata", "Titre")
# Session : datetime + description
ensure_datetime_column("mwcp26_session", "mwcp26_startdatetime", "Début")
ensure_datetime_column("mwcp26_session", "mwcp26_enddatetime", "Fin")
ensure_memo_column("mwcp26_session", "mwcp26_description", "Description")

print("\n[3/4] Lookups")
ensure_lookup("mwcp26_salle",          "mwcp26_ConferenceId", "mwcp26_conference", "Conférence")
ensure_lookup("mwcp26_session",        "mwcp26_ConferenceId", "mwcp26_conference", "Conférence")
ensure_lookup("mwcp26_session",        "mwcp26_SalleId",      "mwcp26_salle",      "Salle")
ensure_lookup("mwcp26_sessionspeaker", "mwcp26_SessionId",    "mwcp26_session",    "Session")
ensure_lookup("mwcp26_sessionspeaker", "mwcp26_SpeakerId",    "contact",           "Intervenant")

publish_all()

print("""
✅ Modèle de données prêt.

  mwcp26_conference     : mwcp26_name (Nom)
  mwcp26_salle          : mwcp26_name (Nom), mwcp26_conferenceid
  mwcp26_session        : mwcp26_name (Titre), mwcp26_description, mwcp26_startdatetime (Début),
                          mwcp26_enddatetime (Fin), mwcp26_conferenceid, mwcp26_salleid
  mwcp26_sessionspeaker : mwcp26_code (auto-number), mwcp26_sessionid, mwcp26_speakerid

Étapes suivantes :
  pac solution export --name mwcp26 --path solution/mwcp26.zip --managed false
  pac solution unpack --zipfile solution/mwcp26.zip --folder solution/src/mwcp26
""")
