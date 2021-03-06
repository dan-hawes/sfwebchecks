<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There area two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router what URI segments to use if those provided
| in the URL cannot be matched to a valid route.
|
*/

// if ($_SERVER['HTTP_HOST'] == 'jamaicanpsalms.scriptureforge.org') {
// 	$route['default_controller'] = "/projects/view/jamaicanpsalms";
// } else {
// 	$route['default_controller'] = "/pages/view/frontpage";
// }
$route['default_controller'] = "/pages/view/frontpage";

$route['404_override'] = '';
$route['login'] = 'auth/login';
$route['auth'] = 'auth/index';
$route['auth/(:any)'] = 'auth/$1';
$route['api/(:any)'] = 'api/service/$1';
$route['projects/(:any)'] = 'projects/view/$1';
$route['signup'] = 'public_app/view/signup';
$route['registration'] = 'public_app/view/registration';
$route['validate/(:any)'] = 'validate/check/$1';
$route['viewcaptcha'] = 'viewcaptcha/index';
$route['app/(:any)'] = 'app/view/$1';
$route['download/assets/(:any)/(:any)'] = 'download/assets/$1/$2';
$route['(:any)/app/(:any)'] = 'app/view/$2/$1';
$route['upload'] = 'upload/receive';
$route['(:any)'] = "pages/view/$1";


/* End of file routes.php */
/* Location: ./application/config/routes.php */
