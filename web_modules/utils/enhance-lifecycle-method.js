// some technics from https://gist.github.com/addyosmani/a0ccf60eae4d8e5290a0#comment-1489585
/* LGRA
  Remplace un appel direct à une méthode toto par une méthode à laquelle est attachée un tableau de méthodes
  et dont le code exécute une à une les méthodes du tableau.
  Si le prototype a une méthode toto, elle sera attachée comme premier élément du tableau sous-jacent.
  Si la méthode toto n'existe pas dans le protoype, ou si toto ne correspond pas à une méthode, le tableau
  sous-jacent ne contiendra que la méthode ajoutée. L'éventuelle propriété sera de fait écrasée.
  La méthode methodName est ajoutée à la fin du tableau sous-jacent (ou au début si l'argument before est true.
  L'ordre d'exécution est tel que les méthodes ont été ajoutée (par exemple sans before, methode du proto puis méthodes ajoutées dans l'ordre d'ajout).
  L'éventuel résultat de la méthode est passé comme dernier argument de la méthode. Attention à le prendre en compte dans la signature de la méthode.
*/


export default function enhanceLifecycleMethod(prototype, methodName, method, unique, before) {
  // si la méthode methodName n'existe pas dans le prototype, intialisation de la propriété à une valeur textuelle
  if (!prototype.hasOwnProperty(methodName)) {
    prototype[methodName] = "init"
  }
  // la propriété methodName existe forcément
  // si elle n'a pas de propriété __methods
  if (!prototype[methodName].hasOwnProperty("__methods")) {
    // on conserve la description de la propriété methodName pour en réinjecté le code dans __methods s'il s'agit d'une méthode
    var d = Object.getOwnPropertyDescriptor(prototype, methodName)
    // on affecte à methodName une fonction d'exécution des méthodes contenues dans le tableau sous-jacent
    prototype[methodName] = function (...arg) {
      var self = this
      return af.reduce((result, f) => { return f.call(self, ...arg, result)}, undefined)
      // var result = af.map((f) => f.call(this, ...arg), this)
      // return result[result.length - 1]
    }
    // on attache à cette méthode le tableau sous-jacent __methods que l'on référence par la variable af
    // dont la portée est accessible de l'intérieur de la fonction
    var af = prototype[methodName].__methods = []
    // si la propriété initiale est bien une fonction, on l'insère dans le tableau __methods
    if (typeof d.value === "function") {
      af.push(d.value)
    }
  }
  // on ajoute au tableau sous jacent la méthode
  // sauf si le paramètre unique est présent et que la méthode est déjà dans le tableau
  if (!unique || (prototype[methodName].__methods.indexOf(method) === -1)) {
    if (before) {
      // si l'on a demandé à ce qu'elle s'éxécute en premier, on la met en tête du tableau
      prototype[methodName].__methods.unshift(method)
    }
    else {
      // si l'on a demandé à ce qu'elle s'éxécute en premier, on la met en fin du tableau
      prototype[methodName].__methods.push(method)
    }
  }
}
