<?php

namespace backend\modules\v1\controllers;

use Yii;
use yii\web\Controller;
use yii\web\Response;
use yii\web\BadRequestHttpException;
use yii\web\ServerErrorHttpException;
use yii\filters\Cors;
use common\components\email\EmailServiceException;

class EmailController extends Controller
{
    public $enableCsrfValidation = false;

    public function behaviors()
    {
        $behaviors = parent::behaviors();

        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['*'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['*'],
                'Access-Control-Allow-Credentials' => false,
                'Access-Control-Max-Age' => 86400,
            ],
        ];

        return $behaviors;
    }

    public function beforeAction($action)
    {
        Yii::$app->response->format = Response::FORMAT_JSON;
        Yii::$app->response->headers->set('Access-Control-Allow-Origin', '*');
        Yii::$app->response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        Yii::$app->response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        Yii::$app->response->headers->set('Access-Control-Max-Age', '86400');
        return parent::beforeAction($action);
    }

    public function actionOptions()
    {
        Yii::$app->response->statusCode = 200;
        Yii::$app->response->headers->set('Allow', 'GET, POST, PUT, DELETE, OPTIONS');
        return [];
    }

    public function actionHealth()
    {
        try {
            return Yii::$app->emailClient->healthCheck();
        } catch (EmailServiceException $e) {
            Yii::error($e->getMessage(), __METHOD__);
            throw new ServerErrorHttpException('Email service is currently unavailable.');
        }
    }

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