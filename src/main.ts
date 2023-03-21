import { config } from 'dotenv';
import Bot from "./bot";
import { getMdlQuestions } from "./utils/getMdlQuestions";

config({
    path: process.env.NODE_ENV ? `.${process.env.NODE_ENV}.env` : '.env'
});

const bootstrap = async () => {
    Bot.Init(await getMdlQuestions());
    await Bot.Launch();

    // const test = `('Из-за чего текст в приложении нигде не отобразится? Подразумевается, что код написан корректно, компилируется и запускается на устройстве без ошибок.\\nMyActivity.java\\n\\npackage com.example.app;\\n\\nimport android.app.Activity;\\nimport android.os.Bundle;\\n\\npublic class ExampleActivity extends Activity {\\n\\n@Override\\npublic void onCreate(Bundle savedInstanceState) {\\nsuper.onCreate(savedInstanceState);\\nsetContentView(new MyDrawView(this));\\n}\\n\\n}\\n\\nMyDrawView.java\\n\\npackage com.example.all;\\n\\nimport android.content.Context;\\nimport android.graphics.Canvas;\\nimport android.graphics.Color;\\nimport android.graphics.Paint;\\nimport android.view.View;\\n\\npublic class MyDrawView extends View {\\n\\npublic MyDrawView(Context context) {\\nsuper(context);\\n}\\n\\nprotected void onDrawView(Canvas canvas) {\\nPaint paint = new Paint();\\npaint.setColor(Color.GREEN);\\npaint.setTextSize(25);\\npaint.setAntiAlias(true);\\ncanvas.drawText(\\"Hello World\\", 5, 30, paint);\\n}\\n}: в классе MyDrawView нужно реализовать метод onDrawStart(); класс MyDrawView должен быть унаследован от SurfaceView; вместо метода onDrawView() должен быть метод onDraw(); вызов метода setContentView() должен ссылаться на значение в R.java; super.onDraw(canvas) должен вызываться в методе onDrawView()', 'вместо метода onDrawView() должен быть метод onDraw()')`;
    //
    // console.log(test.match(/'([^']*)'/g));
}

bootstrap();