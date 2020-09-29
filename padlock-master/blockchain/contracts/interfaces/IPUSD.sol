pragma solidity >0.4.0 < 0.7.0;
//SPDX-License-Identifier: UNLICENSED

/**
 * Padlock v0.1.0 Padlock USD Representative ERC20 Contract Interface
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Interface PUSD ERC20 token
 */
abstract contract IPUSD {
    
    event Financed(address project, uint task, uint value);
    event Refinanced(address project, uint task, uint difference);

    modifier onlyController() {
        require(msg.sender == controller, "Can only be executed from Padlock Service Contract!");
        _;
    }

    address controller;

    /**
     * Directly mint PUSD tokens to an address
     * @dev modifier onlyController
     * @param _to address: address being minted new PUSD tokens
     * @param _value uint: the number of tokens being minted to the address
     * @return _balance uint: the account's PUSD balance post-mint
     */
    function mint(address _to, uint _value) public virtual returns (uint _balance);

    /** 
     * Directly burn PUSD tokens from an address
     * @dev modifier onlyController
     * @param _from address: address having PUSD tokens burned
     * @param _value uint: the number of tokens being burned from the address
     * @return _balance uint: the account's PUSD balance post-burn
     */
    function burn(address _from, uint _value) public virtual returns (uint _balance);

}