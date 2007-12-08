/* 
 * Group: api
 * 
 * Package: crosssite
 * 
 * Summary:
 * 		An API that allows an app to communicate with other websites for things like aggregation
 */
api.xsite = function(url)
{
	return "../backend/api/xsite.php?path="+encodeURIComponent(url);
}
