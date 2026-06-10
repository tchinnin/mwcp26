#!/usr/bin/env python3
"""
MWCP26 — Import de l'agenda (idempotent)

Charge data/import/mwcp-2026-sessions.json dans les tables :
  Conference → Salle → Contact (intervenants) → Session → SessionSpeaker

Ré-exécutable sans risque : chaque enregistrement est recherché par une clé
naturelle avant création ; s'il existe, seuls les champs divergents sont mis à
jour. Aucune table source n'ayant de colonne « external id », les clés sont :

  Conference     : mwcp26_name (= event)
  Salle          : mwcp26_name (room), rattachée à la conférence
  Contact        : firstname + lastname (nom de l'intervenant scindé)
  Session        : mwcp26_name (titre) + mwcp26_startdatetime  → unique (59/59)
  SessionSpeaker : (session, intervenant)

Prérequis :
  - .env présent à la racine (DATAVERSE_URL, TENANT_ID) — voir auth.py
  - Modèle de données déployé (data/scripts/setup_datamodel.py)
"""
import json
import os
import sys
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from auth import get_token, load_env

load_env()

DATAVERSE_URL = os.environ["DATAVERSE_URL"].rstrip("/")
API = f"{DATAVERSE_URL}/api/data/v9.2"
DATA_FILE = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "import", "mwcp-2026-sessions.json"
)

# Jeux d'entités + propriétés de navigation des lookups (vérifiés via metadata).
CONF_SET = "mwcp26_conferences"
SALLE_SET = "mwcp26_salles"
SESSION_SET = "mwcp26_sessions"
SS_SET = "mwcp26_sessionspeakers"
CONTACT_SET = "contacts"

NAV_SALLE_CONF = "mwcp26_ConferenceId"     # Salle    → Conference
NAV_SESSION_CONF = "mwcp26_ConferenceId"   # Session  → Conference
NAV_SESSION_SALLE = "mwcp26_SalleId"       # Session  → Salle
NAV_SS_SESSION = "mwcp26_SessionId"        # SessionSpeaker → Session
NAV_SS_SPEAKER = "mwcp26_SpeakerId"        # SessionSpeaker → Contact

# Longueurs max des champs cibles (troncature défensive).
MAX_JOBTITLE = 100
MAX_MEMO = 2000

# L'événement se tient à Paris en juin 2026 → heure d'été (CEST, UTC+2).
PARIS = timezone(timedelta(hours=2))
UTC = timezone.utc

MONTHS_FR = {
    "janvier": 1, "février": 2, "fevrier": 2, "mars": 3, "avril": 4, "mai": 5,
    "juin": 6, "juillet": 7, "août": 8, "aout": 8, "septembre": 9,
    "octobre": 10, "novembre": 11, "décembre": 12, "decembre": 12,
}


# ── Web API helpers ──────────────────────────────────────────────────────────────

# Caractères de la syntaxe OData à préserver lors de l'encodage des URL.
_ODATA_SAFE = "/?&$=()',:@+*"


def _req(method, path, body=None, extra_headers=None):
    # Les nextLink sont déjà encodés et absolus ; les chemins relatifs (avec
    # espaces dans les $filter) doivent être encodés en préservant la syntaxe OData.
    if path.startswith("http"):
        url = path
    else:
        url = f"{API}/{quote(path, safe=_ODATA_SAFE)}"
    headers = {
        "Authorization": f"Bearer {get_token()}",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Accept": "application/json",
    }
    if body is not None:
        headers["Content-Type"] = "application/json"
    if extra_headers:
        headers.update(extra_headers)
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            raw = resp.read().decode()
            return resp.headers, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as e:
        detail = e.read().decode()
        raise RuntimeError(f"{method} {path} → {e.code}: {detail[:500]}") from e


def get_all(path):
    """GET avec pagination (@odata.nextLink). Retourne la liste des lignes."""
    rows, url = [], path
    while url:
        _, data = _req("GET", url)
        rows.extend(data.get("value", []))
        url = data.get("@odata.nextLink")
    return rows


def create(entity_set, body):
    """POST → retourne le GUID (minuscule) extrait de l'en-tête OData-EntityId."""
    headers, _ = _req("POST", entity_set, body)
    loc = headers.get("OData-EntityId", "")
    return loc[loc.rfind("(") + 1:loc.rfind(")")].lower()


def update(entity_set, record_id, body):
    _req("PATCH", f"{entity_set}({record_id})", body)


def q(text):
    """Échappe une valeur pour un $filter OData (apostrophe doublée)."""
    return text.replace("'", "''")


def ref(entity_set, record_id):
    return f"/{entity_set}({record_id})"


# ── Conversions ──────────────────────────────────────────────────────────────────

def parse_dt(day_str, hhmm):
    """« Mardi 23 juin 2026 » + « 09:00 » → datetime aware (Europe/Paris, CEST)."""
    parts = day_str.split()  # [weekday, day, month, year]
    day, month, year = int(parts[1]), MONTHS_FR[parts[2].lower()], int(parts[3])
    h, m = map(int, hhmm.split(":"))
    return datetime(year, month, day, h, m, tzinfo=PARIS)


def to_instant(odata_dt):
    """Parse une valeur datetime renvoyée par Dataverse (UTC, suffixe Z)."""
    if not odata_dt:
        return None
    return datetime.fromisoformat(odata_dt.replace("Z", "+00:00")).astimezone(UTC)


def trunc(text, n):
    """Tronque à n octets UTF-8 (Dataverse mesure la longueur des memos/strings
    en octets, pas en caractères — un accent compte double)."""
    if not text:
        return text
    encoded = text.encode("utf-8")
    if len(encoded) <= n:
        return text
    return encoded[:n].decode("utf-8", "ignore")


def split_name(full):
    parts = full.split()
    if len(parts) == 1:
        return parts[0], parts[0]
    return parts[0], " ".join(parts[1:])


# ── Chargement source ────────────────────────────────────────────────────────────

with open(DATA_FILE, encoding="utf-8") as f:
    SRC = json.load(f)

EVENT = SRC["event"]
SESSIONS = [s for day in SRC["days"] for s in day["sessions"]]

# Intervenants dédupliqués par nom (premier tagLine/bio rencontré fait foi).
SPEAKERS = {}
for s in SESSIONS:
    for sp in s["speakers"]:
        SPEAKERS.setdefault(sp["name"], {"tagLine": sp.get("tagLine"), "bio": sp.get("bio")})

ROOMS = sorted({s["room"] for s in SESSIONS})

stats = {k: [0, 0, 0] for k in ("conference", "salle", "contact", "session", "link")}  # [créé, maj, inchangé]


def tally(kind, action):
    stats[kind][{"create": 0, "update": 1, "skip": 2}[action]] += 1


# ══ [1/5] Conférence ═══════════════════════════════════════════════════════════════

print(f"\n[1/5] Conférence « {EVENT} »")
rows = get_all(f"{CONF_SET}?$select=mwcp26_conferenceid&$filter=mwcp26_name eq '{q(EVENT)}'")
if rows:
    conf_id = rows[0]["mwcp26_conferenceid"].lower()
    print("  ↩ existante"); tally("conference", "skip")
else:
    conf_id = create(CONF_SET, {"mwcp26_name": EVENT})
    print("  ✓ créée"); tally("conference", "create")


# ══ [2/5] Salles ═══════════════════════════════════════════════════════════════════

print(f"\n[2/5] Salles ({len(ROOMS)})")
existing_salles = {
    r["mwcp26_name"]: r["mwcp26_salleid"].lower()
    for r in get_all(
        f"{SALLE_SET}?$select=mwcp26_name,mwcp26_salleid"
        f"&$filter=_mwcp26_conferenceid_value eq {conf_id}"
    )
}
salle_ids = {}
for room in ROOMS:
    if room in existing_salles:
        salle_ids[room] = existing_salles[room]; tally("salle", "skip")
    else:
        salle_ids[room] = create(SALLE_SET, {
            "mwcp26_name": room,
            f"{NAV_SALLE_CONF}@odata.bind": ref(CONF_SET, conf_id),
        })
        print(f"  ✓ {room}"); tally("salle", "create")
print(f"  ({stats['salle'][0]} créées, {stats['salle'][2]} existantes)")


# ══ [3/5] Intervenants (contacts) ══════════════════════════════════════════════════

print(f"\n[3/5] Intervenants ({len(SPEAKERS)})")
contact_ids = {}
for name in sorted(SPEAKERS):
    fn, ln = split_name(name)
    info = SPEAKERS[name]
    jobtitle = trunc(info["tagLine"], MAX_JOBTITLE)
    bio = trunc(info["bio"], MAX_MEMO)
    rows = get_all(
        f"{CONTACT_SET}?$select=contactid,jobtitle,description"
        f"&$filter=firstname eq '{q(fn)}' and lastname eq '{q(ln)}'"
    )
    if rows:
        cid = rows[0]["contactid"].lower()
        changes = {}
        if (rows[0].get("jobtitle") or None) != (jobtitle or None):
            changes["jobtitle"] = jobtitle
        if (rows[0].get("description") or None) != (bio or None):
            changes["description"] = bio
        if changes:
            update(CONTACT_SET, cid, changes); tally("contact", "update")
        else:
            tally("contact", "skip")
    else:
        cid = create(CONTACT_SET, {
            "firstname": fn, "lastname": ln,
            "jobtitle": jobtitle, "description": bio,
        })
        tally("contact", "create")
    contact_ids[name] = cid
print(f"  ({stats['contact'][0]} créés, {stats['contact'][1]} mis à jour, {stats['contact'][2]} inchangés)")


# ══ [4/5] Sessions ═════════════════════════════════════════════════════════════════

print(f"\n[4/5] Sessions ({len(SESSIONS)})")
existing_sessions = {}
for r in get_all(
    f"{SESSION_SET}?$select=mwcp26_sessionid,mwcp26_name,mwcp26_startdatetime,"
    f"mwcp26_enddatetime,mwcp26_description,_mwcp26_salleid_value"
    f"&$filter=_mwcp26_conferenceid_value eq {conf_id}"
):
    key = (r["mwcp26_name"], to_instant(r["mwcp26_startdatetime"]))
    existing_sessions[key] = r

session_ids = {}  # id source → guid session
for s in SESSIONS:
    start = parse_dt(s["day"], s["startTime"])
    end = parse_dt(s["day"], s["endTime"])
    desc = trunc(s.get("description"), MAX_MEMO)
    salle_id = salle_ids[s["room"]]
    key = (s["title"], start.astimezone(UTC))

    desired = {
        "mwcp26_name": s["title"],
        "mwcp26_description": desc,
        "mwcp26_startdatetime": start.isoformat(),
        "mwcp26_enddatetime": end.isoformat(),
        f"{NAV_SESSION_CONF}@odata.bind": ref(CONF_SET, conf_id),
        f"{NAV_SESSION_SALLE}@odata.bind": ref(SALLE_SET, salle_id),
    }

    existing = existing_sessions.get(key)
    if existing:
        sid = existing["mwcp26_sessionid"].lower()
        changes = {}
        if (existing.get("mwcp26_description") or None) != (desc or None):
            changes["mwcp26_description"] = desc
        if to_instant(existing.get("mwcp26_enddatetime")) != end.astimezone(UTC):
            changes["mwcp26_enddatetime"] = end.isoformat()
        if (existing.get("_mwcp26_salleid_value") or "").lower() != salle_id:
            changes[f"{NAV_SESSION_SALLE}@odata.bind"] = ref(SALLE_SET, salle_id)
        if changes:
            update(SESSION_SET, sid, changes); tally("session", "update")
        else:
            tally("session", "skip")
    else:
        sid = create(SESSION_SET, desired); tally("session", "create")
    session_ids[s["id"]] = sid
print(f"  ({stats['session'][0]} créées, {stats['session'][1]} mises à jour, {stats['session'][2]} inchangées)")


# ══ [5/5] Liens session ↔ intervenant ══════════════════════════════════════════════

print("\n[5/5] Intervenants de session")
existing_links = {
    ((r.get("_mwcp26_sessionid_value") or "").lower(), (r.get("_mwcp26_speakerid_value") or "").lower())
    for r in get_all(f"{SS_SET}?$select=_mwcp26_sessionid_value,_mwcp26_speakerid_value")
}
for s in SESSIONS:
    sid = session_ids[s["id"]]
    for sp in s["speakers"]:
        cid = contact_ids[sp["name"]]
        if (sid, cid) in existing_links:
            tally("link", "skip"); continue
        create(SS_SET, {
            f"{NAV_SS_SESSION}@odata.bind": ref(SESSION_SET, sid),
            f"{NAV_SS_SPEAKER}@odata.bind": ref(CONTACT_SET, cid),
        })
        existing_links.add((sid, cid)); tally("link", "create")
total_links = sum(len(s["speakers"]) for s in SESSIONS)
print(f"  ({stats['link'][0]} créés, {stats['link'][2]} existants / {total_links} liens)")


# ══ Bilan ══════════════════════════════════════════════════════════════════════════

print(f"""
✅ Import terminé.

  Conférence : {EVENT}
  Salles     : {stats['salle'][0]} créées,  {stats['salle'][2]} existantes
  Contacts   : {stats['contact'][0]} créés,  {stats['contact'][1]} màj,  {stats['contact'][2]} inchangés
  Sessions   : {stats['session'][0]} créées, {stats['session'][1]} màj,  {stats['session'][2]} inchangées
  Liens      : {stats['link'][0]} créés,  {stats['link'][2]} existants
""")
