var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var userController = require('../controllers/user_controller');
var sessionController = require('../controllers/session_controller');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

// GET author page
router.get('/author', function(req, res, next) {
  res.render('author');
});


// Autoload de parametros
router.param('quizId', quizController.load); // autoload :quizId
router.param('userId', userController.load); // autoload :userId


// Definición de rutas de sesión
router.get('/session',		sessionController.new);        // Formulario login
router.post('/session', 	sessionController.create);     // Crear sesión
router.delete('/session', 	sessionController.destroy);    // Destruir sesión

// Definición de rutas de cuenta
router.get('/users',			userController.index);   // Listado de usuarios
router.get('/users/:userId(\\d+)',	userController.show);    // Ver un usuario
router.get('/users/new',		userController.new);     // Formulario registro
router.post('/users',			userController.create);  // Registrar usuario
router.get('/users/:userId(\\d+)/edit',	userController.edit);	 // Editar cuenta
router.put('/users/:userId(\\d+)',	userController.update);	 // Actualizar cuenta
router.delete('/users/:userId(\\d+)',	userController.destroy); // Borrar cuenta

// Definición de rutas de /quizzes
router.get('/quizzes.:format?',				quizController.index);
router.get('/quizzes/:quizId(\\d+).:format?',		quizController.show);
router.get('/quizzes/:quizId(\\d+)/check',	quizController.check);
router.get('/quizzes/new',			quizController.new);
router.post('/quizzes',				quizController.create);
router.get('/quizzes/:quizId(\\d+)/edit',	quizController.edit);
router.put('/quizzes/:quizId(\\d+)',		quizController.update);
router.delete('/quizzes/:quizId(\\d+)', 	quizController.destroy);

router.get('/quizzes/:quizId(\\d+)/comments/new',	commentController.new);
router.post('/quizzes/:quizId(\\d+)/comments',		commentController.create);


module.exports = router;
