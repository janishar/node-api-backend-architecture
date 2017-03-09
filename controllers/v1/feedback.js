const Promise = require('bluebird');
const express = require('express');
const router = express.Router();

let Feedback = require('./../../models/feedback');
let BadRequestResponse = require('./../../helpers/response').BadRequestResponse;
let SuccessResponse = require('./../../helpers/response').SuccessResponse;

router.post('/',
    (req, res, next) => {

        req.checkBody('message', "Feedback message is empty").notEmpty();
        req.checkBody('provided_at', "Feedback provided time is empty").notEmpty();
        req.checkBody('provided_at', "Feedback provided time should be a date").isDate();

        var validErr = req.validationErrors();
        if (validErr) {
            return new BadRequestResponse(validErr[0].msg).send(res);
        }

        new Feedback(
            req.userId,
            req.body.message,
            req.body.creation_mode,
            req.body.provided_at
        ).create()
            .then(feedback => {
                return new SuccessResponse("Feedback received successfully.", feedback.getValues()).send(res);
            })
            .catch(err => next(err))
    });

router.put('/:id',
    (req, res, next) => {

        req.checkBody('message', "Feedback message is empty").notEmpty();
        req.checkBody('provided_at', "Feedback provided time is empty").notEmpty();
        req.checkBody('provided_at', "Feedback provided time should be a date").isDate();

        var validErr = req.validationErrors();
        if (validErr) {
            return new BadRequestResponse(validErr[0].msg).send(res);
        }

        return new Feedback()
            .getOne(req.params.id)
            .then(feedback => {

                debug.logAsJSON(feedback);

                feedback._userId = req.userId;
                feedback._message = req.body.message;
                feedback._creationMode = req.body.creation_mode;
                feedback._providedAt = req.body.provided_at;

                return feedback.update();
            })
            .then(feedback => {
                return new SuccessResponse("Feedback received successfully.", feedback.getValues()).send(res);
            })
            .catch(err => next(err))
    });

router.get('/all',
    (req, res, next) => {

        return new Feedback().getAll()
            .then(feedbackList => {

                return Promise.map(feedbackList, feedback => {
                    return feedback.getValues();
                });
            })
            .then(data => {
                return new SuccessResponse("success.", data).send(res);
            })
            .catch(err => next(err))
    });

module.exports = router;
