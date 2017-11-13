/*
@clickOutside("the_ref_of_the_base_component","the_state_boolean_key_indicating_the_visibility_status")
or
@clickOutside({
  ref: "the_ref_of_the_base_component",
  key: "the_state_boolean_key_indicating_the_visibility_status"
})
or
@clickOutside({
  ref: "the_ref_of_the_base_component",
  displayed: function () {return true if panel is displayed} // "this" is the component instance
  perform: function () {do stuff to hide the panel} // "this" is the component instance
})

*/

import enhanceLifecycleMethod from "./enhance-lifecycle-method"

export default function clickOutside (options, stateKey) {
  return function(target) {
    if (typeof options === "string") {
      options = {
        ref: Boolean(stateKey) ? options : "base" + options,
        key: Boolean(stateKey) ? stateKey : "show" + options
      }
    }
    target.prototype.__clickOutSideOptions = {
      ref: options.ref,
      key: options.key || "show",
    }
    target.prototype.__isClickOutSideDisplayed = options.hasOwnProperty("displayed") ? options.displayed :
      function (e) {
        return this.state[this.__clickOutSideOptions.key]
      }
    target.prototype.__doClickOutSide = options.hasOwnProperty("perform") ? options.perform :
      function (e) {
        var newState = {}
        newState[this.__clickOutSideOptions.key] = false
        this.setState(newState)
      }
    enhanceLifecycleMethod(target.prototype, "componentDidUpdate", startClickOutside, true)
    enhanceLifecycleMethod(target.prototype, "componentDidMount", startClickOutside, true)
    enhanceLifecycleMethod(target.prototype, "componentWillUnmount", stopClickOutside, true)
  }
}

function initClickOutside() {
  if (!this.__clickOutSideState) {
    this.__clickOutSideState = {
      isHandled: false,
      handler: null,
      skip: false,
    }
  }
}

function startClickOutside() {
  if (this.__clickOutSideOptions) {
    initClickOutside.bind(this)()
    var displayed = this.__isClickOutSideDisplayed()
    if (displayed && !this.__clickOutSideState.isHandled) {
      this.__clickOutSideState.handler = clickOutSide.bind(this)
      window.addEventListener("click", this.__clickOutSideState.handler, false)
      this.__clickOutSideState.isHandled = true
    }
    else if (!displayed && this.__clickOutSideState.isHandled) {
      window.removeEventListener("click", this.__clickOutSideState.handler, false)
      this.__clickOutSideState.isHandled = false
      this.__clickOutSideState.handler = null
    }
  }
}

function stopClickOutside() {
  if (this.__clickOutSideOptions) {
    if (this.__clickOutSideState.isHandled) {
      window.removeEventListener("click", this.__clickOutSideState.handler, false)
      this.__clickOutSideState.isHandled = false
      this.__clickOutSideState.handler = null
    }
  }
}

function clickOutSide(e) {
  if (!document.body.contains(e.target) || (this.refs[this.__clickOutSideOptions.ref] && this.refs[this.__clickOutSideOptions.ref].contains(e.target))) {
    e.stopPropagation()
  }
  else {
    if (this.__isClickOutSideDisplayed(e)) {
      if (this.__clickOutSideState.skip) {
        this.__clickOutSideState.skip = false
      }
      else {
        this.__doClickOutSide(e)
      }
    }
  }
}

