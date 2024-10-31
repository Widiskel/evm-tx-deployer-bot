// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract YourToken {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public owner;

    constructor(string memory _name, string memory _symbol, uint256 _initialSupply) {
        name = _name;
        symbol = _symbol;
        owner = msg.sender;
        _mint(msg.sender, _initialSupply);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can execute this");
        _;
    }

    function _mint(address _to, uint256 _amount) internal {
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function mint(uint256 _amount) external onlyOwner {
        _mint(msg.sender, _amount);
    }

    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) external {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        payable(msg.sender).transfer(_amount);
        emit Withdrawal(msg.sender, _amount);
    }

    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[msg.sender] >= _amount, "Insufficient balance");
        balanceOf[msg.sender] -= _amount;
        balanceOf[_to] += _amount;
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }

    function approve(address _spender, uint256 _amount) external returns (bool) {
        allowance[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) external returns (bool) {
        require(balanceOf[_from] >= _amount, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _amount, "Allowance exceeded");
        
        balanceOf[_from] -= _amount;
        balanceOf[_to] += _amount;
        allowance[_from][msg.sender] -= _amount;
        
        emit Transfer(_from, _to, _amount);
        return true;
    }

    function getBalance(address _account) public view returns (uint256) {
        return balanceOf[_account];
    }

    event Transfer(address indexed src, address indexed dst, uint256 wad);
    event Deposit(address indexed dst, uint256 wad);
    event Withdrawal(address indexed src, uint256 wad);
    event Approval(address indexed src, address indexed guy, uint256 wad);
}
