<?php

namespace backend\modules\v1\controllers;

use common\models\Faculty;
use common\models\Student;
use common\models\User;
use Yii;
use yii\filters\auth\HttpBearerAuth;
use yii\rest\ActiveController;
use yii\web\ForbiddenHttpException;

class StudentController extends ActiveController
{
    public $modelClass = 'common\models\Student';

    public function behaviors()
    {
        $behaviors = parent::behaviors();
        $behaviors['authenticator'] = [
            'class' => HttpBearerAuth::class,
        ];
        return $behaviors;
    }

    public function actions()
    {
        $actions = parent::actions();
        // Студент создаётся только через вложенный роут
        // POST /v1/faculties/<id>/students — остальные стандартные
        // REST-экшены (index/view/update/delete) пока не задействованы.
        unset(
            $actions['index'],
            $actions['view'],
            $actions['create'],
            $actions['update'],
            $actions['delete']
        );
        return $actions;
    }

    /**
     * POST /v1/faculties/<id>/students
     *
     * faculty_id всегда берётся из URL, а не из тела запроса — так студента
     * нельзя создать в чужом факультете, подменив поле в JSON.
     */
    public function actionCreate($id)
    {
        $faculty = Faculty::findOne($id);

        if (!$faculty) {
            Yii::$app->response->statusCode = 404;
            return ['message' => 'Факультет не найден.'];
        }

        $model = new Student();
        $model->load(Yii::$app->request->getBodyParams(), '');
        $model->faculty_id = $faculty->id;

        if ($model->save()) {
            Yii::$app->response->statusCode = 201;
            return $model;
        }

        Yii::$app->response->statusCode = 422;
        return ['errors' => $model->errors];
    }

    /**
     * DELETE /v1/students/<id>
     * Same role gate as faculty deletion (super_admin, supervisor).
     */
    public function actionDelete($id)
    {
        $this->checkCanDelete();

        $model = Student::findOne($id);
        if (!$model) {
            Yii::$app->response->statusCode = 404;
            return ['message' => 'Студент не найден.'];
        }

        $model->delete();
        Yii::$app->response->statusCode = 204;
    }

    protected function checkCanDelete(): void
    {
        $identity = Yii::$app->user->identity;
        $allowedRoles = [User::ROLE_SUPER_ADMIN, User::ROLE_SUPERVISOR];

        if (!$identity || !in_array($identity->role, $allowedRoles, true)) {
            throw new ForbiddenHttpException('Недостаточно прав для удаления студента.');
        }
    }
}