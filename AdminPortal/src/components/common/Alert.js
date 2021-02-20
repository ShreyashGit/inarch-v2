import Swal from 'sweetalert2';
// import '../../assets/css/allert.scss'
// import './Alert.scss';

export function info(title, message) {
    return Swal.fire({title: title, text: message, type: 'info', allowOutsideClick: false});
}

// export function success(title, message) {
//     return Swal.fire({title: title, text: message, type: 'success', allowOutsideClick: false});
// }

export function warning(title, message) {
    return Swal.fire({title: title, text: message, type: 'warning', allowOutsideClick: false});
}

export function error(title="Something went wrong", message, confirmButtonClass = "btn btn-cancel font-16") {
    return Swal.fire({
        title: title,
        text: message,
        type: 'error',
        customClass: "error-alert-popup",
        confirmButtonClass: confirmButtonClass,
        allowOutsideClick: false
    });
}


export function confirm(title, message, confirmButtonText = "Yes", showCancelButton = true, type = "confirm", showCloseButton = true, confirmButtonClass = "btn btn-primary font-16") {
    return Swal.fire({
        title: title,
        text: message,
        type: type,
        allowOutsideClick: false,
        showCancelButton: showCancelButton,
        cancelButtonText: 'Cancel',
        confirmButtonText: confirmButtonText,
        reverseButtons: true,
        customClass: "custom-alert-popup",
        buttonsStyling: false,
        confirmButtonClass: confirmButtonClass,
        cancelButtonClass: 'mr-3 btn btn-cancel font-16',
        showCloseButton: showCloseButton
    });
}

export function custom(title,message,html,confirmButtonText="Ok",) {
    return Swal.fire({
        title: title,
        icon: 'info',
        html: html,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: confirmButtonText,
        allowOutsideClick: false,
    });
}

export function success(title='Your work has been saved') {
    return Swal.fire({
        position: 'center',
        type: 'success',
        icon: 'success',
        title: title,
        showConfirmButton: false,
        timer: 1500
        
    })
}

export function input(title='Your work has been saved',placeHolder ="Enter here...",confirmButtonText ="Submit") {
    return Swal.fire({
        title: title,
        input: 'textarea',
        position: 'left',
        inputPlaceholder: placeHolder,
        showCloseButton: true,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText: confirmButtonText,
        allowOutsideClick: false

    })
}

export function hideLoading() {
    return Swal.hideLoading();
}

export function showLoading(title="Loading", text="Please wait") {
    return Swal.fire({
        title: title,
        text: text,
        onBeforeOpen: () => {
            Swal.showLoading()
        },
        allowOutsideClick: false,
        showConfirmButton: false
    });
}
