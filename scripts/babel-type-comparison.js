/*
React Hot Loader patches REACT on the fly to make createElement creates an instance of a proxified REACT class, enhanced with hotloading capabilities.
As a side effect, this kind of code will allways return false :

var foo = <MyComponent />
return foo.type === MyComponent

because foo is based on a proxi of MyComponent class.
Bytheway, in production, this code will return tree.

To make the comparison works in dev mode, a solution is to compare the type of the element to the type of a newly created componnent, and not the base class :
return foo.type === (<MyComponent>).type
will works

That's the purpose of this babel plugin. It replaces every expression like { foo.type === MyComponent } by { foo.type === (<MyComponent>).type }
*/

module.exports = function (babel) {
  var t = babel.types;
  return {
    visitor: {
      BinaryExpression(path) {
        if (
          (path.node.operator === '===')
          && (t.isMemberExpression(path.node.left))
          && (t.isIdentifier(path.node.left.property))
          && (path.node.left.property.name === 'type')
          && (t.isIdentifier(path.node.right))
        ) {
          var className = t.stringLiteral(path.node.right.name).value
          var importedClasses = path.hub.file.metadata.modules.imports.reduce((prev, imp) => {
            imp.specifiers.forEach(function (spec) {
              if (spec.local[0].toUpperCase() === spec.local[0]) { prev.push(spec.local) }
            })
            return prev
          }, [])
          if (importedClasses.indexOf(className) !== -1) {
            var newExpr = t.memberExpression(t.jSXElement(t.jSXOpeningElement(t.jSXIdentifier(className), [], true), null, [], true), t.identifier('type'))
            console.warn('fix RHL type comparison issue for class ' + className + ' in ' + path.hub.file.opts.filename)
            var rightPath = path.get('right')
            rightPath.replaceWith(newExpr)
          }
        }
      }
    }
  }
}
