//@dev force the compiler of the contract to always compile it using version greater than equal to 0.5.0
pragma solidity >= 0.5 .0;

import "./IERC20.sol";
import "./SafeMath.sol";

/*
 *@dev represents the Hangman contract
 */
contract HangCrypt {

    using SafeMath
    for uint256;
    /*====================Structs Code Section Start==================== */
    /*
    *@dev Score struct stores all user scores and the level and date of play
    @atr date date at which the game was played
    @atr score the score the player got
    @atr level the level at which the player stopped at
    */
    struct Score {
        uint date;
        uint256 score;
        uint256 level;
    }

    /*
    *@dev Player struct stores all player attributes
    @atr id the wallet address of the player
    @atr balance the total no of hangman tokens the player has won
    @atr active indicates if the player is registered or not
    @atr levelsCompletedKeys completed levels by player
    @atr challengesCompletedKeys completed challenges by player
    @atr challengesIndex indicates the current index of the challenges completed by player
    @atr isPlaying represents if the player is currently playing the game or not
    */
    struct Player {
        address id;
        uint256 balance;
        bool active;
        bool isPlaying;
        uint256 challengesIndex;
        uint256[] challengesKeys;
        mapping(bytes => Score) Scores;
        mapping(uint256 => Challenge) Challenges;
    }

    /**
     * @dev represents each level
     * @atr level the level the player completed
     * @atr completed if the level was completed
     * @atr date date at which the level was late attempted
     */


    /**
    *@dev represents the structure of a challenge released by the contract
    * @atr dateReleased date at which it was released
    * @atr completed if the Challenge has been completed
    * @atr difficulty how difficult the word is a number between 1-7
    @atr active indicates if the the current challenge is active or not
    */

    struct Challenge {
        bytes32 word;
        bool completed;
        bool active;
    }

    /*
    *@dev Stake represents a players stake at a point in time whilst they play the game
    @atr stake the number of tokens the player has staked
    @atr is the stake active or not
    */
    struct Stake {
        uint256 stake;
        bool active;
    }
    /*====================Contract Variables Code Section Start==================== */

    //@dev stores all Registered Players
    mapping(address => Player) Players;
    //@dev stores all player stakes at a given time
    mapping(address => Stake) PlayerStakes;
    //@dev represents the owner of the contract
    address owner;

    //@dev the defualt balance for every new PlayerStakes
    uint256 defualtBalance = 1000;
    IERC20 HangToken;
    /*====================Modifier Code Section Start==================== */

    /*
     *@dev ensures that certain functions are called by the owner of the contract
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    /*====================Main Function Code Section Start==================== */

    /*
    *@dev constructor
    @var owner we set the owner of the contract to the contract caller
    @var hisghest we set the highest score to zero and level to zero
    */
    constructor(address tokenAddress) public {
        require(tokenAddress != address(0), "Invalid token address");
        HangToken = IERC20(tokenAddress);
        owner = msg.sender;
    }

    /*====================Player Code Section Start==================== */

    /*
    *@dev registeres the caller as a new player and assigns 1000 Hang Tokens
    @ret string message indicating the player was added succesfully
    @ret uint256 the balance of the new user i.e. 1000
    @notice we assign each attribute of the Player struct individually to avoid
    having to set a fixed size for the keys arrays cointained in the struct i.e. a shortcut to
    ccreating dynamic arrays
    */
    function registerPlayer() external returns(string memory, uint256) {
        require(msg.sender != address(0), "Invalid sender address");
        require(!Players[msg.sender].active, "Player already registered");
        require(msg.sender != owner, "Token Deployer not allowed to play the Game");
        require(HangToken.transferFrom(owner, msg.sender, defualtBalance.add(10 ** HangToken.decimals())),
            "Something went wrong whilst trying to transfer tokens to player");
        Players[msg.sender].id = msg.sender;
        Players[msg.sender].active = true;
        Players[msg.sender].balance = defualtBalance.add(10 ** HangToken.decimals());
        Players[msg.sender].isPlaying = false;
        return ("added Player", 1000);
    }
    /*
     *@dev checks a given player is registered or not
     */

    function playerRegistered() external view returns(bool) {
        require(msg.sender != address(0), "Invalid sender address");
        return Players[msg.sender].active;
    }

    function isPlayerinAGame() public view returns(bool) {
        require(msg.sender != address(0), "invalid sender address");
        return Players[msg.sender].active && Players[msg.sender].isPlaying;
    }

    function cancelLatestGame() public returns(bool) {
        require(msg.sender != address(0), "Invalid sender address");
        require(Players[msg.sender].active, "Player not registered");
        Players[msg.sender].isPlaying = false;
        return Players[msg.sender].isPlaying;
    }

    function newChallenge(bytes32 word) public returns(bool) {
        require(msg.sender != address(0), "Invalid sender address");
        require(Players[msg.sender].active, "Player not registered");
        require(!Players[msg.sender].isPlaying, "Player is currently in another Game");
        Players[msg.sender].Challenges[Players[msg.sender].challengesIndex] = Challenge(word, false, true);
        Players[msg.sender].isPlaying = true;
        Players[msg.sender].challengesIndex = Players[msg.sender].challengesIndex.add(1);
        return true;
    }
    /*
    *@dev allows the player to play the Hangman game
    @param the stake the user is willing to loose or win
    @ret bool if the player stake was accepted
    */
    function play(uint256 stake) external returns(bool) {
        require(msg.sender != address(0), "invalid sender address");
        require(msg.sender != owner, "Token Deployer not allowed to play the Game");
        require(Players[msg.sender].active, "Player not registered");
        uint256 tokenStake = (stake.add(10 ** HangToken.decimals()));
        require(Players[msg.sender].balance >= tokenStake, "Insuficient funds to play game");
        require(stake > 0, "Stake has to be greater than 0");
        PlayerStakes[msg.sender] = Stake(tokenStake, true);
        return true;
    }
    /*
    *@dev during every round a player may decide to give and collect all they winnings this function is responsible for
    * crediting they balance with players stake
    @param penalties apply in the following instances
    if the player raged quit there is a penalty associated with doing so
    player has a zero guesses left and decides to quit
    @param level the level the player stopped at
    @ret string a message that indicates that the players stakes have been credited to they accounts
    @notice more penalty instances will be added in the future
    */
    function freezeStakes(uint256 penalties) external returns(string memory) {
        require(msg.sender != address(0), "Invalid sender address");
        require(Players[msg.sender].isPlaying, "Player not playing");
        require(PlayerStakes[msg.sender].active, "No Active Stakes for player");
        require(penalties >= 0, "penalties must be greater than and equal to 0");
        uint256 amount = PlayerStakes[msg.sender].stake;
        delete PlayerStakes[msg.sender];
        amount = amount.sub(penalties.add(10 ** HangToken.decimals()));
        HangToken.transferFrom(owner, msg.sender, amount);
        Players[msg.sender].balance = Players[msg.sender].balance.sub(penalties);
        Players[msg.sender].balance = Players[msg.sender].balance.add(amount);
        Players[msg.sender].isPlaying = false;
        return "Successfully credited tokens to player account";
    }
    /* *@dev
    gets a players balance *@ ret uint256 represents the players balance */
    function getBalance() external view
    returns(uint256) {
        require(msg.sender != address(0), "Invalid sender address");
        require(Players[msg.sender].active, "Player not registered");
        return HangToken.balanceOf(msg.sender);
    }
    /* *@dev
    returns all completed Challenges by a player */
    function getPlayerCompletedChallenges() external view
    returns(uint256[] memory) {
        require(msg.sender != address(0), "Invalid sender address");
        require(Players[msg.sender].active, "Player not registered");
        return Players[msg.sender].challengesKeys;
    }

    /*====================ERC20 Code Section Start==================== */
    function getTotalSupply() public onlyOwner view returns(uint256) {
        return HangToken.totalSupply();
    }

    function getOwnerBalance() public view onlyOwner returns(uint256) {
        return HangToken.balanceOf(owner);
    }

    function getDecimals() public view onlyOwner returns(uint256) {
        return HangToken.decimals();
    }
}