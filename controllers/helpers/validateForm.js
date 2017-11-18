const elementIsValid = ({ type, children, options }) => {
    if (options.width) {
        if (type === 'box') {
            if (children.length > 0) {
                const invalidElements = children.filter(element => !elementIsValid(element))
                return invalidElements.length === 0;
            }
            return false
        }
        return true;
    }
    return false;
}

const elementsAreValid = (form) => {
    const invalidElements = form.topLevelElements.filter(element => !elementIsValid(element))
    console.error('here', invalidElements.length === 0);
    return invalidElements.length === 0;
} 

const formIsValid = (form) => {
    return form.title.length > 0 && elementsAreValid(form);
}

module.exports = { formIsValid, elementsAreValid, elementIsValid };