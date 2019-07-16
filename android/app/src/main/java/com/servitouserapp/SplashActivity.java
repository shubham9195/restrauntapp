package com.servitouserapp;

import android.content.Intent;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

public class SplashActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInsstanceState){
     super.onCreate(savedInsstanceState);

     Intent intent = new Intent(this,MainActivity.class);
     startActivity(intent);
     finish();
    }
}
