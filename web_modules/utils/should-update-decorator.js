/** s'utilise en insérant le code suivant avant la déclaration de la classe à décorer

import shouldUpdate from "utils/should-update-decorator"

@shouldUpdate(type)
où type est pris parmi :
- "shallow" : premier niveau de propriété sauf les functions
- "simple" : premier niveau de propriété y compris les functions
- "deep" : tous les niveaux de propriété sauf les functions
- "all" : tous les niveaux de propriété y compris les functions
- "verbose" : premier niveau de propriété sauf les functions, avec indication dans la console des rendus préservés
   et des propriétés ou états modifiés ayant entrainé un nouveau rendu

**/

import enhanceLifecycleMethod from "./enhance-lifecycle-method"


export default function shouldUpdate(type) {
  return function (target) {
    if (type === "all") {
      enhanceLifecycleMethod(target.prototype, "shouldComponentUpdate", shouldComponentUpdateAll, true, true)
    }
    else if (type === "deep") {
      enhanceLifecycleMethod(target.prototype, "shouldComponentUpdate", shouldComponentUpdateDeep, true, true)
    }
    else if (type === "simple") {
      enhanceLifecycleMethod(target.prototype, "shouldComponentUpdate", shouldComponentUpdateSimple, true, true)
    }
    else {
      if (type === "verbose" && (module.hot || process.env.debug)) {
        enhanceLifecycleMethod(target.prototype, "shouldComponentUpdate", shouldComponentUpdateShallowVerbose, true, true)
      }
      else {
        enhanceLifecycleMethod(target.prototype, "shouldComponentUpdate", shouldComponentUpdateShallow, true, true)
      }
    }
  }
}


// shallow except function (default type) & verbose

function shouldComponentUpdateShallow(nextProps, nextState) {
  return !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState))
}
function shouldComponentUpdateShallowVerbose(nextProps, nextState) {
  var shouldUpdate = !(shallowEqual(this.props, nextProps) && shallowEqual(this.state, nextState))
  if (!shouldUpdate) {
    console.log("preserved render of " + this.constructor.name)
  }
  else {
    var info = { type: this.constructor.name }
    shallowDiff(info, "Props mutation", this.props, nextProps)
    shallowDiff(info, "State mutation", this.state, nextState)
    console.log(info)
  }
  return shouldUpdate
}
function shallowEqual(a, b) {
  for (var key in a) {
    if (typeof a[key] !== "function" && (!(key in b) || a[key] !== b[key])) {
      return false
    }
  }
  for (var key in b) {
    if (typeof a[key] !== "function" && (!(key in a) || a[key] !== b[key])) {
      return false
    }
  }
  return true;
}
function shallowDiff(info, infoKey, a, b) {
  var result = {}
  for (var key in a) {
    if (typeof a[key] !== "function" && (!(key in b) || a[key] !== b[key])) {
      result[key] = { old: a[key], new: b[key] }
    }
  }
  for (var key in b) {
    if (typeof a[key] !== "function" && (!(key in a) || a[key] !== b[key])) {
      result[key] = { old: a[key], new: b[key] }
    }
  }
  if (Object.keys(result).length > 0) {
    info[infoKey] = result
  }
}

// simple shallow

function shouldComponentUpdateSimple(nextProps, nextState) {
  return !(simpleEqual(this.props, nextProps) && simpleEqual(this.state, nextState))
}
function simpleEqual(a, b) {
  for (var key in a) {
    if (!(key in b) || a[key] !== b[key]) {
      return false
    }
  }
  for (var key in b) {
    if (!(key in a) || a[key] !== b[key]) {
      return false
    }
  }
  return true;
}

// deep except function

function shouldComponentUpdateDeep(nextProps, nextState) {
  return !(deepEqual(this.props, nextProps) && deepEqual(this.state, nextState))
}
function deepEqual(a, b) {
  for (var key in a) {
    if (typeof a[key] !== "function" && (!(key in b) || !deepEqual(a[key], b[key]))) {
      return false
    }
  }
  for (var key in b) {
    if (typeof a[key] !== "function" && (!(key in a) || !deepEqual(a[key], b[key]))) {
      return false
    }
  }
  return true;
}

// deep

function shouldComponentUpdateAll(nextProps, nextState) {
  return !(allEqual(this.props, nextProps) && allEqual(this.state, nextState))
}
function allEqual(a, b) {
  if (a === null && b !== null || a !== null && b === null) {
    return false
  }
  if (typeof a === "string" && typeof b === "string") {
    return a === b
  }
  for (var key in a) {
    if (!(key in b) || !allEqual(a[key], b[key])) {
      return false
    }
  }
  for (var key in b) {
    if (!(key in a) || !allEqual(a[key], b[key])) {
      return false
    }
  }
  return true;
}
