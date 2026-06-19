/** Squelette de chargement initial (mobile, US-102-02) — badges heure + cartes en shimmer. */
const GROUPS = [1, 5, 1, 5, 1]

export function ListSkeleton() {
  return (
    <div aria-hidden>
      {GROUPS.map((cards, gi) => (
        <section className="tgroup" key={gi}>
          <div className="thead">
            <span className="sk sk-time" />
            <span className="tline" />
          </div>
          <div className="tcards">
            {Array.from({ length: cards }).map((_, ci) => (
              <div className="sk sk-card" key={ci} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
