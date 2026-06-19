import ampLogo from '../assets/amp-logo.png?inline'
import { APP_VERSION } from '../version'

export function Footer() {
  return (
    <div className="foot">
      <img src={ampLogo} alt="aMP" />
      <span>Événement par aMP Community · Données Sessionize · {APP_VERSION}</span>
    </div>
  )
}
