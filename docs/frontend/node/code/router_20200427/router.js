function route(handle, pathname) { 
  if (typeof handle[pathname] === 'function') { 
    return handle[pathname](); 
  } else {
    return pathname + ' is not defined';
  } 
} 
exports.route = route; 