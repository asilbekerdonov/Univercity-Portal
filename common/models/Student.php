<?php

namespace common\models;

use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;

class Student extends ActiveRecord
{
    public static function tableName()
    {
        return '{{%students}}';
    }

    public function behaviors()
    {
        return [TimestampBehavior::class];
    }

    public function rules()
    {
        return [
            [['name', 'age', 'course', 'faculty_id'], 'required'],
            ['name', 'string', 'max' => 255],
            [['age', 'course'], 'integer'],
            ['faculty_id', 'integer'],
            ['faculty_id', 'exist', 'targetClass' => Faculty::class, 'targetAttribute' => 'id'],
        ];
    }

    public function fields()
    {
        return ['id', 'name', 'age', 'course', 'faculty_id'];
    }
}