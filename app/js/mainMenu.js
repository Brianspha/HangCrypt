import EmbarkJS from 'Embark/EmbarkJS';
import HangCrypt from "../../embarkArtifacts/contracts/HangCrypt";
import $ from "jquery";
import Swal from 'sweetalert2';
EmbarkJS.onReady(function (val, err) {
    console.log("error: ", err)
    console.log(val)



    /*==========Metamask events Detection Start==========*/

    window.ethereum.on('accountsChanged', function (accounts) {
        location.href = "/"
    })
    window.ethereum.on('networkChanged', function (netId) {
        location.href = "/"
    })
    window.ethereum.on('networkChanged', function (netId) {
        location.href = "/"
    })
    /*==========Metamask detection Start==========*/
    if (typeof web3 !== 'undefined') {
        console.log('MetaMask is installed')
    } else {
        Swal.fire({
            type: 'error',
            title: 'OH Noo',
            text: 'MetaMask is not installed!',
            footer: "<a href='https://metamask.io/;';>Please visit their website for instructions of how to download it</a>"
        })
        console.log('MetaMask is not installed')
    }

    //@dev end metamask detection

    //@dev status browser detection
    if (window.ethereum.status) {
        success("Detected Status browser!!!")
    }

    /*==========Main Code Start==========*/

    // Click listener
    $('body').on('click', function (e) {
        var screen = $(e.target).data('screen');
        console.log(screen)
        if (screen) {
            game.ScreenManager.setScreen(screen);
        }
    });

    /*==========Button Clicks Start==========*/


    function success(message) {
        Swal.fire(
            'Success',
            message,
            'success'
        )
    }

    function error(message) {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false,
        })
        swalWithBootstrapButtons.fire(
            'eror',
            message,
            'error'
        ).then((result) => {
            if (result.value) {
                play()
            } else if (
                // Read more about handling dismissals
                result.dismiss === Swal.DismissReason.cancel
            ) {
                game.ScreenManager.setScreen("menu")
            }
        })
    }
    $('.challenges').click(function (e) {
        e.preventDefault();
        var children = e.target.innerHTML
        localStorage.setItem("level", children)
        window.location.href = "./mainMenu.html";
    })


    /*==========Smart Contract Calls Start==========*/
    function play() {
        HangCrypt.methods.playerRegistered().call({
            gas: 8000000
        }).then(function (val, err) {
            if (err) {
                error('Something went wrong!')
            }
            if (!val) {
                Swal.fire({
                    title: 'Registration error!',
                    text: "Seems like you not registered would you like to register",
                    showCancelButton: true,
                    type: 'error',
                    confirmButtonColor: 'gray',
                    cancelButtonColor: 'skyblue',
                    confirmButtonText: 'Register',
                    showLoaderOnConfirm: true,
                    showLoaderOnConfirm: true,
                    allowOutsideClick: () => false,
                    preConfirm: () => {
                        var spinHandle = loadingOverlay.activate();
                        HangCrypt.methods.registerPlayer().send({
                            from: web3.eth.defaultAccount,
                            gas: 8000000
                        }).then(function (val, err) {
                            if (err) {
                                error('Something went wrong')
                            } else {
                                success('Succesfully Registered Player')
                            }
                            loadingOverlay.cancel(spinHandle);
                        })
                    }
                }).then((result) => {
                    if (!result.value) {
                        game.ScreenManager.setScreen("menu")
                    }
                }).catch((err) => {
                    console.log("err: ", err)
                    error('Something went wrong!')
                    loadingOverlay.cancel(spinHandle);
                })
            } else {
                //location.href="index.html"
            }
        })
    }
    //@dev smartcontract calls end


    /*==========Screen Manager Start Start==========*/

    (function (NS) {

        NS.ScreenManager = {};

        var _current_screen_name = '',
            _current_screen_node = null;

        NS.ScreenManager = {
            screens: ['menu', 'instructions', 'credits', 'challenges'],

            init: function (default_screen_name) {
                this.setScreen(default_screen_name);
            },

            /**
             * You can pass an optional callback to execute after screen set
             */
            setScreen: function (screen_name, callback) {
                if (typeof screen_name !== 'string' || _current_screen_name === screen_name) return;
                _current_screen_name = screen_name;

                if (screen_name == "challenges") {
                    var levels = play()
                }
                // show the current screen
                $('.' + _current_screen_name).addClass('show').focus();


                // hide the rest of the screens
                // forming a class string using reduce function with all classes which
                // are equal to current screen
                $(this.screens.reduce(function (str, class_name) {
                    return str + (class_name === _current_screen_name ? '' : ',.' + class_name);
                }, '').slice(1)).removeClass('show');
                if (callback) {
                    callback.apply(this);
                }
            },

            getCurrentScreen: function () {
                return _current_screen_name;
            }
        };
    })(window.game = window.game || {});

    window.game.ScreenManager.init('menu');
    //@dev main menu screen code end

}) //@dev end embarkjs.onReady