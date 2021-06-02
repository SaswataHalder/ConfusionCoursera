const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
var authenticate = require('../authenticate');
const Favorites = require('../models/favourite');
const cors = require('./cors');
const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({user:req.user._id})
            .populate('user')
            .populate('favorites')
            .then((favorites) => {
                //if ((JSON.stringify(favorites.user._id) === JSON.stringify(req.user._id))) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                if (favorites == null || favorites == undefined)
		            res.json({dishes: []});
	            else
		            res.json(favorites);
                //}
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null && favorite != undefined) {
                    req.body.forEach((item) => {
                        favorite.favorites.addToSet(item);
                    });
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('favorites')
                                .then((favorites) => {
                                    if (favorites == null || favorites == undefined)
		                                res.json({dishes: []});
	                                else
		                                res.json(favorites);
                                })
                        }, (err) => next(err));
                }
                else if (favorite == null || favorites == undefined) {
                    Favorites.create(req.user._id)
                        .then((favorite) => {
                            Favorites.updateMany({user:(req.user.id), favorites: (req.body) })
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate('user')
                                        .populate('favorites')
                                        .then((favorites) => {
                                            if (favorites == null || favorites == undefined)
		                                        res.json({dishes: []});
	                                        else
		                                        res.json(favorites);
                                        })
                                })
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));        
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.remove({ user: req.user._id })
            .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);            
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favoriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (favorites == null || favorites == undefined) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                }
                else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    }
                    else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null && favorite != undefined) {
                    favorite.favorites.addToSet({ "_id": (req.params.dishId) });
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('favorites')
                                .then((favorites) => {
                                    if (favorites == null || favorites == undefined)
		                                res.json({dishes: []});
	                                else
		                                res.json(favorites);
                                })
                        }, (err) => next(err));
                }
                else if (favorite == null || favorite == undefined) {
                    Favorites.create(req.user._id)
                        .then((favorite) => {
                            Favorites.updateMany({user:(req.user.id), favorites: (req.body) })
                                .then((favorite) => {
                                    Favorites.findById(favorite._id)
                                        .populate('user')
                                        .populate('favorites')
                                        .then((favorites) => {
                                            if (favorites == null || favorites == undefined)
		                                        res.json({dishes: []});
	                                        else
		                                        res.json(favorites);
                                        })
                                })
                        }, (err) => next(err))
                        .catch((err) => next(err));
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /favorites/' + req.params.dishId)
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null && favorite != undefined) {
                    favorite.favorites.pull(req.params.dishId);
                    favorite.save()
                        .then((favorite) => {
                            Favorites.findById(favorite._id)
                                .populate('user')
                                .populate('favorites')
                                .then((favorites) => {
                                    if (favorites == null || favorites == undefined)
		                                res.json({dishes: []});
	                                else
		                                res.json(favorites);
                                })
                        }, (err) => next(err));
                }
                else if (favorite == null || favorite == undefined) {
                    err = new Error('Logging favorite ' + req.params.favoriteId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });    

module.exports = favoriteRouter;