var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');

/*
 * Autenticar un usuario: Comprueba si el usuario está registrado en users
 * Devuelve una Promesa que busca el usuario con el login dado y comprueba su password.
 * Si la autenticación es correcta, la promesa se satisface devolviendo un objeto con el User.
 * Si la autenticación falla, la promesa se satisface devolviendo null.
 */
var authenticate = function(login, password) {

	return models.User.findOne({where: {username: login}}).then(function(user) {
     		if ( user && user.verifyPassword(password)) {
			return user;
		} else {
			return null;
		}
	   });
};

// GET /session  -- Formulario de login
exports.new = function(req, res, next) {
 
  var redir = req.query.redir || url.parse(req.headers.referer || "/").pathname;
  
  if (redir === '/session' || redir === '/users/new') { redir = "/"; }

  res.render('session/new', { redir: redir });
};


// POST /session   --Crear sesión
exports.create = function(req, res, next) {

   var redir = req.body.redir || '/'

   var login = req.body.login;
   var password = req.body.password;

   authenticate(login, password).then(function(user) {
	if (user) {
		req.session.user = {id:user.id, username:user.username};
		res.redirect(redir);  // Redireccionamos a redir
	} else {
		req.flash('error', 'La autenticación ha fallado. Inténtelo otra vez.');
		res.redirect("/session?redir="+redir);
	}
   });
};



// DELETE /session    --Destruir sesión
exports.destroy = function(req, res, next) {
	delete req.session.user;

        res.redirect("/session"); // Redirect a login
};
