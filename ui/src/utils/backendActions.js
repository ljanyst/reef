//------------------------------------------------------------------------------
// Author: Lukasz Janyst <lukasz@jany.st>
// Date: 17.03.2019
//
// Licensed under the GPL 3 License, see the LICENSE file for details.
//------------------------------------------------------------------------------

import { backend } from './Backend';

export function tagNew(name, color) {
  return backend.sendMessage({
    action: 'TAG_NEW',
    tagNewParams: {name,  color}
  });
}

export function tagDelete(id) {
  return backend.sendMessage({
    action: 'TAG_DELETE',
    tagDeleteParams: id
  });
}

export function tagEdit(id, newName, newColor) {
  return backend.sendMessage({
    action: 'TAG_EDIT',
    tagEditParams: {id, newName, newColor}
  });
}

export function projectNew(name) {
  return backend.sendMessage({
    action: 'PROJECT_NEW',
    projectNewParams: name
  });
}

export function projectGet(id) {
  return backend.sendMessage({
    action: 'PROJECT_GET',
    projectGetParams: id
  });
}

export function projectDelete(id) {
  return backend.sendMessage({
    action: 'PROJECT_DELETE',
    projectDeleteParams: id
  });
}

export function projectEdit(id, title, description, tags) {
  return backend.sendMessage({
    action: 'PROJECT_EDIT',
    projectEditParams: {id, title, description, tags}
  });
}

export function taskNew(projectId, taskDescription) {
  return backend.sendMessage({
    action: 'TASK_NEW',
    taskNewParams: {projectId, taskDescription}
  });
}

export function taskDelete(taskId) {
  return backend.sendMessage({
    action: 'TASK_DELETE',
    taskDeleteParams: taskId
  });
}

export function taskToggle(taskId) {
  return backend.sendMessage({
    action: 'TASK_TOGGLE',
    taskToggleParams: taskId
  });
}

export function taskEdit(taskId, taskDescription) {
  return backend.sendMessage({
    action: 'TASK_EDIT',
    taskEditParams: {taskId, taskDescription}
  });
}
