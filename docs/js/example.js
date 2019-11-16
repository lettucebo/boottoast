function showAlert() {
  boottoast.alert("This is a simple toast!");
}

function showAlertWithOptions() {
  boottoast.alert({
    message: "This is a toast with config options!",
    title: "Big title",
    smallTitle: "11 min ago",
    delay: 5000
  });
}

function showAlertWithAllOptions() {
  //   boottoast.hide();
  $(".boottoast-position").remove();
  boottoast.alert({
    message: "This is a toast with config options!",
    title: "Big title",
    smallTitle: "11 min ago",
    // additional class string applied to the top level dialog
    className: null,
    // whether or not to include a close button
    closeButton: true,
    // dialog container
    container: "body",
    // Horizontal placement: left, center, right, only works for first time
    horizontalPlacement: "left",
    // Vertical placement: top, center, bottom, right, only works for first time
    verticalPlacement: "bottom",
    // Delay hiding the toast (ms)
    delay: 2000
  });
}

function showPrimary() {
  boottoast.primary({
    message: "This is a toast with config options!",
    title: "Big title",
    smallTitle: "11 min ago",
    delay: 5000
  });
}

function showSecondary() {
    boottoast.secondary({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showSuccess() {
    boottoast.success({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showDanger() {
    boottoast.danger({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showWarning() {
    boottoast.warning({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showInfo() {
    boottoast.info({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showLight() {
    boottoast.light({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }

  function showDark() {
    boottoast.dark({
      message: "This is a toast with config options!",
      title: "Big title",
      smallTitle: "11 min ago",
      delay: 5000
    });
  }