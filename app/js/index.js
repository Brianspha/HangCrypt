import EmbarkJS from 'Embark/EmbarkJS';
import HangCrypt from "../../embarkArtifacts/contracts/HangCrypt";
import $ from "jquery";
import alertify from "alertifyjs";
import Swal from 'sweetalert2'
EmbarkJS.onReady(function (err) {
  console.log("error: ", err)

  //@dev create a global variable for assigning staked user coins
  let Gstake = 0;


  /*==========Metamask events Detection Start==========*/

  window.ethereum.on('accountsChanged', function (accounts) {
    window.location = "/"
  })
  window.ethereum.on('networkChanged', function (netId) {
    window.location = "/"
  })
  window.ethereum.on('networkChanged', function (netId) {
    window.location = "/"
  })

  /*==========Metamask  Detection Start==========*/
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


  function success(message) {
    Swal.fire(
      'Success',
      message,
      'success'
    )
  }

  function warning() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })

    swalWithBootstrapButtons.fire({
      title: 'Heads Up',
      text: "Seems like you have an existing game",
      type: 'warning',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'No continue with game',
      cancelButtonText: 'Yes, Start Over!!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        success('Conntinuing with game!!')
        renderGame()
      } else if (
        // Read more about handling dismissals
        result.dismiss === Swal.DismissReason.cancel
      ) {
        var spinHandle = loadingOverlay.activate();
        HangCrypt.methods.cancelLatestGame().send({
          gas: 8000000
        }).then((receipt, err) => {
          console.log(receipt)
          if (!err) {
            loadingOverlay.cancel(spinHandle);
            init()
          }
        }).catch((err) => {
          loadingOverlay.cancel(spinHandle);
          window.location.href = "/";
          console.log(err)
          warning()
        })
      }
    }).catch((err) => {
      error('Something went wrong! ')
      window.location.href = "/";
    })
  }
  /*==========Helper Functions Code Start==========*/

  function error(message) {
    Swal.fire({
      type: 'error',
      title: 'Oops...',
      text: message,
      allowOutsideClick: false
    })
  }

  /*==========HangCrypt Code Start==========*/
  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const hardWords = require('../json/words.json');




  /*==========SmartContract Calls Code Start==========*/

  function getTokenBalance() {
    HangCrypt.methods.getBalance().call({
      gas: 8000000
    }).then(function (val, err) {
      var bal = 0;
      if (err) {
        error("Something went wrong!")
      } else {
        bal = val;
        console.log(bal)
      }
      balance = val;
      return bal;
    }).catch((err) => {
      console.log(err)
      balance = 0
      error("Something went wrong! whilst getting you balance")
    })
  }

  /*==========Game Rendering Functions Code Start==========*/
  //@dev initialise the game session asking the user to stake a certain amount of tokens
  function init() {
    //@dev request user stake start
    Swal.fire({
      title: 'Stake to Play',
      text: "To play the game you have to stake a certain number of tokens if your new you have a 6000 free HangCrypt Tokens",
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Play',
      showLoaderOnConfirm: true,
      allowOutsideClick: false,
      preConfirm: (stake) => {
        if (stake <= 0) {
          Swal.showValidationMessage(
            `Stake must be greater than 0 and not: ${stake}`
          )
          return;
        } else {
          var spinHandle = loadingOverlay.activate();
          HangCrypt.methods.isPlayerinAGame().call({
            gas: 8000000
          }).then((results, err) => {
            if (results) {
              loadingOverlay.cancel(spinHandle);
              warning()
            } else {
              //@dev get all completed levels by player
              HangCrypt.methods.play(stake).send({
                gas: 8000000
              }).then(function (val, err) {
                Gstake = stake
                console.log(val)
                loadingOverlay.cancel(spinHandle);
                renderGame();
              }).catch((err) => {
                console.log(err)
                error('Something went wrong!')
                loadingOverlay.cancel(spinHandle);
                init()
              })
            }
          }).catch((err) => {
            error('Something went wrong! ')
            loadingOverlay.cancel(spinHandle);
            init()
          })
        }
      }
    }).then((result) => {
      console.log("here", result)
      if (result.dismiss) {
        window.location.href = "/";
      }
    })
  }

  function choice(list) {
    let userSelected = JSON.parse(localStorage.getItem("level"))
    var inrange = list.filter((word) => {
      return word.difficulty == userSelected
    })
    var word = inrange[Math.floor(inrange.length * Math.random())]
    console.log("selecting: ", word)
    return word.word;
  }

  function renderGame() {

    new Vue({
      el: "#app",
      data() {
        this.selected = choice(hardWords)
        document.getElementById("app").style.display = "block";
        return {
          incorrectLetters: [],
          correctLetters: [],
          secretWord: '',
          won: false,
          die: false,
          customWord: '',
          addWordActive: false,
          hideText: false,
          penalties: 0,
          level: localStorage.getItem("level"),
          stake: Gstake,
          balance: 0,
          penelatyIncrementor: 5,
        };
      },
      mounted() {
        this.getTokenBalance();
        this.newGame()
        this.stake = Gstake
      },
      computed: {
        letters() {
          return allLetters.map(c => ({
            char: c,
            wrong: this.incorrectLetters.includes(c),
            correct: this.correctLetters.includes(c)
          }));
        },
        secretLetters() {
          return this.secretWord.split("").map(c => {
            return this.correctLetters.includes(c) ? c : "\u00A0";
          });
        }
      },
      methods: {
        stakeOut: async function() {
          var spinHandle = loadingOverlay.activate();
          await HangCrypt.methods.cancelLatestGame().send({
            gas: 8000000
          })
          if (!this.die) {
            this.penalties = this.incorrectLetters.length * this.penelatyIncrementor * this.level;
            HangCrypt.methods.freezeStakes(this.penalties).send({
              gas: 8000000
            }).then((receipt, err) => {
              loadingOverlay.cancel(spinHandle);
              init()
            }).catch((err)=>{
              loadingOverlay.cancel(spinHandle);
              location.href = '/'
            })
          } else {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: false,
            })

            swalWithBootstrapButtons.fire({
              title: 'Oops',
              text: "You cant stake out due to failing to guess the word",
              type: 'warning',
              allowOutsideClick: false,
              showCancelButton: false,
              confirmButtonText: 'To Start Menu',
              reverseButtons: true
            }).then((result) => {
              if (result.value) {
                location.href = '/'
              }
            })
          }
        },
        newChallenge: async function () {
          var spinHandle = loadingOverlay.activate();
          console.log(web3.utils.fromAscii(this.selected), this.level)
          await HangCrypt.methods.cancelLatestGame().send({
            gas: 8000000
          })
          HangCrypt.methods.newChallenge(web3.utils.fromAscii(this.selected)).send({
            gas: 8000000
          }).then((receipt, err) => {
            loadingOverlay.cancel(spinHandle);
          }).catch((err) => {
            loadingOverlay.cancel(spinHandle);
            location.href = '/'
          })
        },
        addLetter(c) {
          if (this.secretWord.indexOf(c) >= 0) {
            this.correctLetters.push(c);
            this.won = this.secretWord.
            split("").
            every(c => this.correctLetters.includes(c));
          } else {
            this.incorrectLetters.push(c);
            this.addLetter.penalties += this.incorrectLetters.length * this.penelatyIncrementor * this.level;
            this.die = this.incorrectLetters.length > 6;
          }
          if (this.die) {
            this.incorrectLetters = []
            this.correctLetters.map((character) => {
              this.incorrectLetters.push(character)
            })
          }
        },
        newGame() {
          this.incorrectLetters = [];
          this.correctLetters = [];
          this.secretWord = choice(hardWords);
          this.won = false;
          this.die = false;
          this.customWord = '';
          this.addWordActive = false;
          this.newChallenge()
        },
        play() {
          this.incorrectLetters = [];
          this.correctLetters = [];
          this.secretWord = this.customWord.toUpperCase().replace(/[^A-Z]/g, '');
          this.won = false;
          this.die = false;
          this.customWord = '';
          this.addWordActive = false;
        },
        getTokenBalance() {
          let This = this
          HangCrypt.methods.getBalance().call({
            gas: 8000000
          }).then(function (bal, err) {
            if (!err) {
              This.balance = Math.round(bal / 10 ** 18)
            }
          }).catch((err) => {
            This.balance = 0
            //error("Something went wrong! whilst getting you balance")
          })
        }
      }
    });
    //@dev hangman code end
  }

  init(); //@dev initialise game
}) //@dev end embarkjs.onReady