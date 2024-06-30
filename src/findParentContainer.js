export const classFindParentContainer = (target, className) => {
  if (target.classList.contains(className)) {
    return target;
  }
  if (target == document.body) {
    return null;
  }
  return classFindParentContainer(target.parentElement, className);
};

export const idFindParentContainer = (target, idName) => {
  if (target.id == idName) {
    return target;
  }
  if (target == document.body) {
    return null;
  }
  return idFindParentContainer(target.parentElement, idName);
};
