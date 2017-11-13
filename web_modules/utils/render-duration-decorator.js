/** s'utilise en insérant le code suivant avant la déclaration de la classe à décorer

import renderDuration from "utils/render-duration-decorator"

@renderDuration

 */

import enhanceLifecycleMethod from "./enhance-lifecycle-method"

export default function renderDuration (target) {
  if (module.hot) {
    enhanceLifecycleMethod(target.prototype, "render", durationStart, true, true)
    enhanceLifecycleMethod(target.prototype, "componentDidUpdate", durationEnd, true, false)
    enhanceLifecycleMethod(target.prototype, "componentDidMount", durationEnd, true, false)
  }
}

function durationStart() {
  this.__startRender = performance.now()
  console.log("Render of " + this.constructor.name + " start at " + (new Date()).toTimeString())
}
function durationEnd()
{
  console.log("Render of " + this.constructor.name + " finished at " + (new Date()).toTimeString() + " - duration: " + (performance.now() - this.__startRender) + " ms")
}
