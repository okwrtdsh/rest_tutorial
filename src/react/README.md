# Redux TodoMVC Example

This project template was built with [Create React App](https://github.com/facebookincubator/create-react-app), which provides a simple way to start React projects with no build configuration needed.

Projects built with Create-React-App include support for ES6 syntax, as well as several unofficial / not-yet-final forms of Javascript syntax such as Class Properties and JSX.  See the list of [language features and polyfills supported by Create-React-App](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#supported-language-features-and-polyfills) for more information.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.


### 追加
* TODO: constantsの定数を使う

```diff
diff --git a/package.json b/package.json
old mode 100755
new mode 100644
index 2a9a7ef..87992e2
--- a/package.json
+++ b/package.json
@@ -15,6 +15,9 @@
     "react-redux": "^5.0.3",
     "react-test-renderer": "^15.5.4",
     "redux": "^3.5.2",
+    "redux-thunk": "^2.2.0",
+    "superagent": "^3.5.2",
+    "superagent-django-csrf": "^0.1.3",
     "todomvc-app-css": "^2.1.0"
   },
   "scripts": {
diff --git a/src/containers/App.js b/src/containers/App.js
index 1354c30..9f81f29 100755
--- a/src/containers/App.js
+++ b/src/containers/App.js
@@ -15,11 +15,13 @@ const App = ({todos, actions}) => (
 
 App.propTypes = {
   todos: PropTypes.array.isRequired,
-  actions: PropTypes.object.isRequired
+  actions: PropTypes.object.isRequired,
+  loading: PropTypes.bool.isRequired
 }
 
 const mapStateToProps = state => ({
-  todos: state.todos
+  todos: state.todos,
+  loading: state.loading
 })
 
 const mapDispatchToProps = dispatch => ({
diff --git a/src/index.js b/src/index.js
index 44f50ab..de4cf45 100755
--- a/src/index.js
+++ b/src/index.js
@@ -1,16 +1,25 @@
 import React from 'react'
 import { render } from 'react-dom'
-import { createStore } from 'redux'
+import { createStore, applyMiddleware, compose } from 'redux'
 import { Provider } from 'react-redux'
 import App from './containers/App'
 import reducer from './reducers'
 import 'todomvc-app-css/index.css'
+import thunk from 'redux-thunk';
+import { apiMiddleware } from "./middlewares"
 
-const store = createStore(reducer)
+const finalCreateStore = compose(
+  applyMiddleware(apiMiddleware),
+  applyMiddleware(thunk)
+)(createStore);
+
+const store = finalCreateStore(reducer);
 
 render(
   <Provider store={store}>
     <App />
   </Provider>,
   document.getElementById('root')
-)
+);
+
+store.dispatch({type: 'GET_TODO'})
diff --git a/src/middlewares/index.js b/src/middlewares/index.js
new file mode 100644
index 0000000..8b39b67
--- /dev/null
+++ b/src/middlewares/index.js
@@ -0,0 +1,108 @@
+import request from 'superagent'
+import 'superagent-django-csrf'
+
+export const apiMiddleware = store => next => action => {
+  switch (action.type) {
+    case 'GET_TODO':
+      next(action);
+      request
+        .get('/todos/').end((err, res) => {
+          if (err) {
+            return next({
+              type: 'GET_TODO_ERROR',
+              err
+            });
+          }
+          const data = JSON.parse(res.text)["results"];
+          console.log('GET_TODO_END', data);
+          next({
+            type: 'GET_TODO_END',
+            data
+          });
+        });
+      break;
+
+    case 'ADD_TODO':
+      next(action);
+      request
+        .post('/todos/')
+        .send({ text: action.text }).end((err, res) => {
+          if(err) {
+            return next({
+              type: 'ADD_TODO_ERROR',
+              err
+            });
+          }
+          console.log('ADD_TODO_END', JSON.parse(res.text));
+        });
+      break
+
+    case 'EDIT_TODO':
+      next(action);
+      request
+        .patch('/todos/' + action.id + '/')
+        .send({ text: action.text }).end((err, res) => {
+          if(err) {
+            return next({
+              type: 'EDIT_TODO_ERROR',
+              err
+            });
+          }
+          console.log('EDIT_TODO_END', JSON.parse(res.text));
+        });
+      break
+
+    case 'DELETE_TODO':
+      next(action);
+      request
+        .delete('/todos/' + action.id + '/').end((err, res) => {
+          if(err) {
+            return next({
+              type: 'DELETE_TODO_ERROR',
+              err
+            });
+          }
+          console.log('DELETE_TODO_END');
+        });
+      break
+
+    case 'COMPLETE_TODO':
+      next(action);
+      request
+        .patch('/todos/' + action.id + '/')
+        .send({ completed: store.getState()['todos'].filter(todo => todo.id === action.id)[0].completed }).end((err, res) => {
+          if(err) {
+            return next({
+              type: 'COMPLETE_TODO_ERROR',
+              err
+            });
+          }
+          const data = JSON.parse(res.text);
+          console.log('COMPLETE_TODO_END', data);
+          return next({
+            type: 'COMPLETE_TODO_END',
+            data
+          });
+        });
+      break
+
+    case 'CLEAR_COMPLETED':
+      store.getState()['todos'].filter(todo => todo.completed === true).map(todo => {
+        request
+          .delete('/todos/' + todo.id + '/').end((err, res) => {
+            if(err) {
+              return next({
+                type: 'CLEAR_COMPLETED_ERROR',
+                err
+              });
+            }
+          });
+      });
+      console.log('CLEAR_COMPLETED_END');
+      next(action);
+      break
+
+    default:
+      break;
+  }
+};
diff --git a/src/reducers/index.js b/src/reducers/index.js
index a94ace3..c857d95 100755
--- a/src/reducers/index.js
+++ b/src/reducers/index.js
@@ -1,7 +1,9 @@
 import { combineReducers } from 'redux'
 import todos from './todos'
+import loading from './loading'
 
 const rootReducer = combineReducers({
+  loading,
   todos
 })
 
diff --git a/src/reducers/loading.js b/src/reducers/loading.js
new file mode 100644
index 0000000..910a152
--- /dev/null
+++ b/src/reducers/loading.js
@@ -0,0 +1,13 @@
+const loading = (state = false, action) => {
+  switch (action.type) {
+    case 'GET_TODO_DATA':
+      return true
+    case 'GET_TODO_DATA_RECEIVED':
+      return false
+    case 'GET_TODO_DATA_ERROR':
+      return false
+    default:
+      return state
+  }
+}
+export default loading
diff --git a/src/reducers/todos.js b/src/reducers/todos.js
index 5afb9bc..cd11abc 100755
--- a/src/reducers/todos.js
+++ b/src/reducers/todos.js
@@ -2,7 +2,7 @@ import { ADD_TODO, DELETE_TODO, EDIT_TODO, COMPLETE_TODO, COMPLETE_ALL, CLEAR_CO
 
 const initialState = [
   {
-    text: 'Use Redux',
+    text: 'ERROR',
     completed: false,
     id: 0
   }
@@ -49,6 +49,9 @@ export default function todos(state = initialState, action) {
     case CLEAR_COMPLETED:
       return state.filter(todo => todo.completed === false)
 
+    case 'GET_TODO_END':
+      return action.data
+
     default:
       return state
   }
```
