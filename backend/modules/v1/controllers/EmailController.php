<?php

namespace backend\modules\v1\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;
use common\components\email\EmailServiceException;

/**
 * /v1/email/* — тонкий прокси-слой над Email Service (Go).
 * Не содержит бизнес-логики отправки — только валидацию входных данных
 * и делегирование в common\components\email\EmailClient.
 */
class EmailController extends Controller
{
    public $enableCsrfValidation = false;

    public function beforeAction($action)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        return parent::beforeAction($action);
    }

    /**
     * GET /v1/email/health
     */
    public function actionHealth()
    {
        try {
            return Yii::$app->emailClient->healthCheck();
        } catch (EmailServiceException $e) {
            Yii::error($e->getMessage(), __METHOD__);
            throw new ServerErrorHttpException('Email service is currently unavailable.');
        }
    }

    /**
     * POST /v1/email/send
     * Body: { "to": "...", "subject": "...", "body": "...", "is_html": false }
     */
    public function actionSend()
    {
        $request = Yii::$app->request;

        $to = (string) $request->post('to', '');
        $subject = (string) $request->post('subject', '');
        $body = (string) $request->post('body', '');
        $isHtml = (bool) $request->post('is_html', false);

        if ($to === '' || $subject === '' || $body === '') {
            throw new BadRequestHttpException('Fields "to", "subject" and "body" are required.');
        }

        if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
            throw new BadRequestHttpException('Field "to" must be a valid email address.');
        }

        try {
            $result = Yii::$app->emailClient->send($to, $subject, $body, $isHtml);
        } catch (EmailServiceException $e) {
            Yii::error($e->getMessage(), __METHOD__);
            throw new ServerErrorHttpException('Failed to send email: ' . $e->getMessage());
        }

        Yii::$app->response->statusCode = 202;

        return $result;
    }

    /**
     * GET /v1/email/status/<id>
     */
    public function actionStatus($id)
    {
        try {
            return Yii::$app->emailClient->status((int) $id);
        } catch (EmailServiceException $e) {
            Yii::error($e->getMessage(), __METHOD__);
            throw new ServerErrorHttpException('Failed to fetch email status: ' . $e->getMessage());
        }
    }
}