require("./index.css")

import React, { Component } from "react"

function getSvgBody(svg) {
  return svg
    .replace(/<\?xml[\s\S]*?>/gi, "")
    .replace(/<!doctype[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<svg[^>]+>/gi, "")
    .replace(/<\/svg>/gi, "")
    .replace(/\n/gi, " ")
    .replace(/\t/gi, " ")
    .replace(/ +/gi, " ")
    .trim()
}

// IE doesn't implement innerHTML on svg tag and subsequent

import shouldUpdate from "utils/should-update-decorator"

@shouldUpdate() // "verbose"
class IconIE extends Component {

  static state = {
    svgCounter: 0
  }

  componentWillReceiveProps = (newProps) => {
    this.setState({ svgCounter: this.state.svgCounter + 1 * (newProps.svg !== this.props.svg) })
  }

  componentDidMount() {
    var sgv = getSvgBody(this.props.svg)
    var ieDivWrapper = document.createElement("div")
    ieDivWrapper.innerHTML = "<svg>" + sgv + "</svg>"
    Array.prototype.forEach.call(ieDivWrapper.firstChild.childNodes, (child) => {
      this.refs.itemG.appendChild(child)
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.svg !== this.props.svg) {
      this.componentDidMount()
    }
  }

  render() {
    if (!this.props.svg.trim().match(/^\s*</g)) {
      console.warn("Please use <IconSvg> with <svg> file. props= " + JSON.stringify(this.props))
    }

    var { svg, className, half, title, ...other } = this.props

    var match = (/viewBox="([^"]+)"/).exec(svg)
    var boxSize = match instanceof Array && match.length > 1 ? match[1] : half ? "0 0 256 512" : "0 0 512 512"
    return (
      <svg className={"svgIcon" + (half ? " svgIcon--half" : "") + (className ? " " + className : "")} key={this.state.svgCounter} {...other}
        version="1.1" enableBackground={"new " + boxSize} viewBox={boxSize}>
        {Boolean(title) && <title>{title}</title>}
        <g ref="itemG" dangerouslySetInnerHTML={{ __html: "" }} />
      </svg>
    )
  }
}


// common way to insert svg path in the component, and to be use when IE11 React 15 bug will be fixed :

var Icon = ({ svg, className, half, title, ...other }) => {
  var match = (/viewBox="([^"]+)"/).exec(svg)
  var boxSize = match instanceof Array && match.length > 1 ? match[1] : half ? "0 0 256 512" : "0 0 512 512"
  return (
    <svg className={"svgIcon" + (half ? " svgIcon--half" : "") + (className ? " " + className : "")} {...other}
      version="1.1" enableBackground={"new " + boxSize} viewBox={boxSize}>
      {Boolean(title) && <title>{title}</title>}
      <g dangerouslySetInnerHTML={{ __html: getSvgBody(svg) }} />
    </svg>
  )
}

var svgns = "http://www.w3.org/2000/svg"
var svg = document.createElementNS(svgns, "svg")
var supportInnerHtml = svg.innerHTML !== undefined && !svg.hasOwnProperty("innerHTML")


/* FB a apporté dans React 15 un contournement à l'absence d'innerHtml sur le tag SVG dans IE11 basé sur ce hack
Comme ici, il test si l'élément a ou pas une propriété innerHtml pour déclancher le hack
Sauf que Edge implémente innerHtml sur le tag SVG, met à jour le DOM avec ce qu'on lui fourni, mais ne dessine rien
En attendant une correction plus intéligente, du style browser sniffing, je met en oeuvre le hack en permanance
https://github.com/facebook/react/issues/7563
 */
var edge = window.navigator.userAgent.indexOf('Edge/') > 0

Icon = edge || !supportInnerHtml ? IconIE : Icon

export default Icon
