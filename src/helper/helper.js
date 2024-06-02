let GetOrDefault = function (item, defaultValue) {
  if (!item) {
    return typeof defaultValue === 'function' ? defaultValue(item) : defaultValue;
  }
  return item;
}


let GenPrevNextUrls = function (request, page, limit, total) {
  let url = GetFullUrl(request)
  console.log(url)
  var totalPages = Math.ceil(total / limit);
  var nextPage = Math.floor(page) < Math.floor(totalPages) ? Math.floor(page) + 1 : null;
  var prevPage = Math.floor(page) > 1 && Math.floor(page) <= Math.floor(totalPages) ? Math.floor(page) - 1 : null;

  return {
    next: nextPage == null ? null : ObjToQueryString({ page: nextPage, limit: limit, total: total }),
    prev: prevPage == null ? null : ObjToQueryString({ page: prevPage, limit: limit, total: total })
  };
}

let GetFullUrl = function (request) {
  return (
    `${request.protocol}` +
    '://' +
    `${request.get('host')}${request.baseUrl + request.path}`
  )
}

let ObjToQueryString = function (obj) {
  var params = new URLSearchParams();
  console.log({ params })
  Object.keys(obj).forEach(function (key) {
    params.append(key, obj[key]);
  });
  return params.toString();
}
module.exports = { GetOrDefault, GenPrevNextUrls }
