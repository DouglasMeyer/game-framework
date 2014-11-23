function createElement(opts){
  var tag = opts.tag || 'div',
      parent = opts.parent || document.body,
      el = document.createElement(tag);
  parent.appendChild(el);
  delete opts.tag;
  delete opts.parent;
  for (var attr in opts){
    var attrMD = attr.match(/^@(.+)/);
    if (attrMD){
      el.setAttribute(attrMD[1], opts[attr]);
    } else {
      el[attr] = opts[attr];
    }
  }
  return el;
}
