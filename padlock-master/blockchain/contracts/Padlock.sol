pragma solidity >0.4.0 <0.7.0;
//SPDX-License-Identifier: UNLICENSED

import './interfaces/IPadlock.sol';
import './Project.sol';
import './interfaces/IProject.sol';
import './PUSD.sol';

/**
 * Padlock v0.1.0 Padlock Service Contract
 * Author: Blox Consulting LLC
 * Last Updated: 07.20.2020
 *
 * Main on-chain client
 */
contract Padlock is IPadlock {
  constructor() public {
    roles[msg.sender] = uint256(Role.Admin);
    emit AdminAdded(msg.sender);
    token = createPUSD();
  }

  /// MUTABLE FUNCTIONS ///

  // Registration //

  function enrollAdmin(address _admin) public override onlyAdmin {
    require(roles[_admin] == uint256(Role.None), 'Address is already enrolled in Padlock!');
    roles[_admin] = uint256(Role.Admin);
    emit AdminAdded(_admin);
  }

  function enrollOwner(address _owner) public override onlyAdmin {
    require(roles[_owner] == uint256(Role.None), 'Address is already enrolled in Padlock!');
    roles[_owner] = uint256(Role.Owner);
    emit OwnerAdded(_owner);
  }

  function enrollGC(address _gc) public override onlyOwner {
    require(roles[_gc] == uint256(Role.None), 'Address is already enrolled in Padlock!');
    roles[_gc] = uint256(Role.GC);
    emit GCAdded(_gc);
  }

  // Project //

  function newProject(address _owner, uint256[] memory fees) public override onlyGC returns (address _at) {
    Project project = new Project(_owner, msg.sender, token, fees);
    projectSerial = projectSerial.add(1);
    projects[projectSerial] = address(project);
    _at = address(project);
    emit ProjectAdded(projectSerial);
  }

  function fundTask(address _project, uint256 _task) public override onlyAdmin returns (uint256 _minted) {
    _minted = IProject(_project).getCost(_task);
    PUSD(token).mint(_project, _minted);
    IProject(_project).fundTask(_task);
    emit TaskFunded(_project, _task);
  }

  function fundProject(address _project) public override onlyAdmin returns (uint256 _minted) {
    _minted = IProject(_project).projectCost();
    PUSD(token).mint(_project, _minted);
    IProject(_project).fundProject();
    emit ProjectFunded(_project, _minted);
  }

  /// VIEWABLE FUNCTIONS ///
  function balance(address _of) public override view returns (uint256 _tokens) {
    return PUSD(token).balanceOf(_of);
  }

  /// INTERNAL FUNCTIONS ///

  /**
   * Deploy a PUSD Contract for the Padlock
   *
   * @return _pusd address: the address of the deployed PUSD contract
   */
  function createPUSD() internal returns (address _pusd) {
    return address(new PUSD());
  }
}
