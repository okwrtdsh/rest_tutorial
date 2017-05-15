import request from 'superagent'
import 'superagent-django-csrf'

export const apiMiddleware = store => next => action => {
  switch (action.type) {
    case 'GET_TODO':
      next(action);
      request
        .get('/todos/').end((err, res) => {
          if (err) {
            return next({
              type: 'GET_TODO_ERROR',
              err
            });
          }
          const data = JSON.parse(res.text)["results"];
          console.log('GET_TODO_END', data);
          next({
            type: 'GET_TODO_END',
            data
          });
        });
      break;

    case 'ADD_TODO':
      next(action);
      request
        .post('/todos/')
        .send({ text: action.text }).end((err, res) => {
          if(err) {
            return next({
              type: 'ADD_TODO_ERROR',
              err
            });
          }
          console.log('ADD_TODO_END', JSON.parse(res.text));
        });
      break

    case 'EDIT_TODO':
      next(action);
      request
        .patch('/todos/' + action.id + '/')
        .send({ text: action.text }).end((err, res) => {
          if(err) {
            return next({
              type: 'EDIT_TODO_ERROR',
              err
            });
          }
          console.log('EDIT_TODO_END', JSON.parse(res.text));
        });
      break

    case 'DELETE_TODO':
      next(action);
      request
        .delete('/todos/' + action.id + '/').end((err, res) => {
          if(err) {
            return next({
              type: 'DELETE_TODO_ERROR',
              err
            });
          }
          console.log('DELETE_TODO_END');
        });
      break

    case 'COMPLETE_TODO':
      next(action);
      request
        .patch('/todos/' + action.id + '/')
        .send({ completed: store.getState()['todos'].filter(todo => todo.id === action.id)[0].completed }).end((err, res) => {
          if(err) {
            return next({
              type: 'COMPLETE_TODO_ERROR',
              err
            });
          }
          const data = JSON.parse(res.text);
          console.log('COMPLETE_TODO_END', data);
          return next({
            type: 'COMPLETE_TODO_END',
            data
          });
        });
      break

    case 'CLEAR_COMPLETED':
      store.getState()['todos'].filter(todo => todo.completed === true).map(todo => {
        request
          .delete('/todos/' + todo.id + '/').end((err, res) => {
            if(err) {
              return next({
                type: 'CLEAR_COMPLETED_ERROR',
                err
              });
            }
          });
      });
      console.log('CLEAR_COMPLETED_END');
      next(action);
      break

    default:
      break;
  }
};
