pragma solidity >0.4.0 < 0.7.0;
//SPDX-License-Identifier: UNLICENSED

import "./interfaces/IPUSD.sol";
import "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * Padlock v0.1.0 Padlock USD Representative ERC20 Contract
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * PUSD ERC20 token
 */
contract PUSD is IPUSD, ERC20("Padlock USD", "PUSD") {

    constructor() public {
        controller = msg.sender;
    }

    function mint(address _to, uint _value) public override onlyController returns (uint _balance) {
        _mint(_to, _value);
        return balanceOf(_to);
    }

    function burn(address _from, uint _value) public override onlyController returns (uint _balance) {
        _burn(_from, _value);
        return balanceOf(_from);
    }

}