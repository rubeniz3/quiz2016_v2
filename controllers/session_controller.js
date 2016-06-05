var models = require('../models');
var Sequelize = require('sequelize');
var url = require('url');


// MW: se requiere hacer login
//
// Si el usuario ya hizo login anteriormente, existirá el objeto user en req.session, por lo que continuo con el resto de MWs
// Si no existe req.session.user redireccionamos a la pantalla de login
// Guardo en redir mi url para volver automaticamente despues de hacer login, pero si redir ya existe conservo su valor.
//
exports.loginRequired = function(req, res, next) { 
	if( req.session.user ) {
	  next();
        } else {
	    res.redirect('/session?redir=' + (req.param('redir') || req.url));
	}
};

// MW que permite gestionar un usuario si el usuario logeado es admin o el usuario a gestionar.
exports.adminOrMyselfRequired = function(req, res, next){

	var isAdmin		= req.session.user.isAdmin;
	var userId		= req.user.id;
	var loggedUserId	= req.session.user.id;

	if (isAdmin || userId === loggedUserId) {
		next();
	} else {
	  console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
	  res.send(403);
	}
};

// MW que permite gestionar un usuario solamente si el usuario logeado es admin y NO el usuario a gestionar
exports.adminAndNotMyselfRequired = function(req, res, next) {

	var isAdmin		= req.session.user.isAdmin;
	var userId		= req.user.id;
	var loggedUserId	= req.session.user.id;

	if (isAdmin && userId !== loggedUserId) {
	   next();
	} else {
	    console.log('Ruta prohibida: no es el usuario logeado, ni un administrador.');
	    res.send(403);
	}
};

// MW que controla que la sesión expire a los 2 minutos de inactividad
exports.autologout = function(req, res, next) {
	
	if (req.session.user) {
        	var horaInicio		= req.session.user.horaInicio;
		var horaActual		= (new Date()).getTime();

        	if ( (horaActual - horaInicio) < 120000) {
	        	req.session.user.horaInicio = (new Date()).getTime();
		        next();
		} else {
			delete req.session.user;
			console.log('Su sesión ha expirado');
	        	res.redirect("/session"); 
		}
	} else {
	  next();
	}
};
		
 	

	

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

   var redir = req.body.redir || '/';

   var login = req.body.login;
   var password = req.body.password;

   authenticate(login, password).then(function(user) {
	if (user) {
		req.session.user = {id:user.id, username:user.username, isAdmin: user.isAdmin, horaInicio: (new Date()).getTime()};
		res.redirect(redir);  // Redireccionamos a redir
	} else {
		req.flash('error', 'La autenticación ha fallado. Inténtelo otra vez.');
		res.redirect("/session?redir="+redir);
	}
	})
	.catch(function(error) {
	  req.flash('error', 'Se ha producido un error: '+ error);
          next(error);
   });
};



// DELETE /session    --Destruir sesión
exports.destroy = function(req, res, next) {
	delete req.session.user;

        res.redirect("/session"); // Redirect a login
};
