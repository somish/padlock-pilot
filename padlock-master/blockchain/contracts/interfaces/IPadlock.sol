pragma solidity >0.4.0 <0.7.0;
//SPDX-License-Identifier: UNLICENSED

import '../../node_modules/@openzeppelin/contracts/math/SafeMath.sol';
import './IPUSD.sol';
import { Tasks, Task } from '../libraries/Tasks.sol';

/**
 * Padlock v0.1.0 Padlock Service Contract interface
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Interface for main on-chain client
 */
abstract contract IPadlock {
  /// LIBRARIES ///
  using SafeMath for uint256;
  using Tasks for Task;

  /// EVENTS ///
  event ProjectAdded(uint256 _index);
  event AdminAdded(address _admin);
  event OwnerAdded(address _owner);
  event GCAdded(address _gc);
  event TaskFunded(address _project, uint256 _task);
  event ProjectFunded(address _project, uint _value);

  /// MODIFIERS ///
  modifier onlyAdmin() {
    require(roles[msg.sender] == uint256(Role.Admin), 'Method can only be called by an administrator!');
    _;
  }

  modifier onlyOwner() {
    require(roles[msg.sender] == uint256(Role.Owner), 'Method can only be called by an Owner!');
    _;
  }

  modifier onlyGC() {
    require(roles[msg.sender] == uint256(Role.GC), 'Method can only be called by a General Contractor!');
    _;
  }

  /// ENUMERATIONS ///
  enum Role { None, GC, Owner, Admin }

  /// VARIABLES ///
  mapping(address => uint256) public roles;
  mapping(uint256 => address) public projects;

  uint256 public projectSerial;
  address token;

  /// MUTABLE FUNCTIONS ///

  // Registration //

  /**
   * Enroll a new address as an administrator
   * @dev modifier onlyAdmin
   * @param _admin the address to be given elevated priveledges
   */
  function enrollAdmin(address _admin) public virtual;

  /**
   * Enroll a new address as an owner
   * @dev modifier onlyAdmin
   * @param _owner the address to be given owner priveledges
   */
  function enrollOwner(address _owner) public virtual;

  /**
   * Enroll a new address as a general contractor
   * @dev modifier onlyAdmin
   * @dev who should pay for the transaction? Admin is used to remove user gas costs, but less decentralized
   * @param _gc the address to be given gc priveledges
   */
  function enrollGC(address _gc) public virtual;

  // Project //

  /**
   * Deploy a new Project contract
   * @dev modifier onlyGC
   * @param _owner the address enrolled as the owner of the project
   * @param _fees array of integers representing payment for
   * @return _at address: the address of the newly deployed project contract
   */
  function newProject(address _owner, uint256[] memory _fees) public virtual returns (address _at);

  /**
   * Finance a task, if the task has not yet already been financed
   * @dev modifier onlyAdmin
   * @param _project address: the address of the project being minted to
   * @param _task uint: the serial of the task within the project
   * @return _minted uint: the number of PUSD tokens minted for the project escrow
   */
  function fundTask(address _project, uint256 _task) public virtual returns (uint256 _minted);

  /**
   * Finance the General Contractor fee escrow
   * @dev modifier onlyAdmin
   * @param _project the address of the project being funded
   * @return _minted the number of PUSD tokens sent into the project contract
   */
  function fundProject(address _project) public virtual returns (uint256 _minted);

  /// VIEWABLE FUNCTIONS ///

  /**
   * Determine the PUSD balance of an address
   * @param _of address: the address being queried for token balance
   * @return _tokens uint: the number of PUSD tokens owned by that address
   */
  function balance(address _of) public virtual view returns (uint256 _tokens);
}
