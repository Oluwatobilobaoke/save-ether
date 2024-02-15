import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SaveEther", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploySaveEther() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const SaveEther = await ethers.getContractFactory("SaveEther");
    const saveEther = await SaveEther.deploy();

    return { owner, otherAccount, saveEther };
  }

  describe("Deployment", function () {
    it("Should be able to deploy the contract", async function () {
      const { saveEther } = await loadFixture(deploySaveEther);

      expect(saveEther.target).to.not.equal(0);
    });
  });

  describe("Deposit", function () {
    it("Should be able to deposit ether", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      const depositAmount = ethers.parseEther("1");

      await saveEther.deposit({ value: depositAmount });

      const balance = await saveEther.checkSavings(owner.address);

      expect(balance).to.equal(depositAmount);
    });

    it("should not be able to deposit if value is 0", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      await expect(saveEther.deposit({ value: 0 })).to.be.revertedWith(
        "can't save zero value"
      );
    });
  });

  describe("Withdraw", function () {
    it("Should be able to withdraw ether", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      const depositAmount = ethers.parseEther("1");

      await saveEther.deposit({ value: depositAmount });

      const balanceBefore = await saveEther.checkSavings(owner.address);

      await saveEther.withdraw();

      const balanceAfter = await saveEther.checkSavings(owner.address);

      expect(balanceAfter).to.equal(0);
    });

    it("should not be able to withdraw if the balance is 0", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      await expect(saveEther.withdraw()).to.be.revertedWith(
        "you don't have any savings"
      );
    });

    it("should not be able to withdraw from another account", async function () {
      const { owner, otherAccount, saveEther } = await loadFixture(
        deploySaveEther
      );

      const depositAmount = ethers.parseEther("1");

      await saveEther.deposit({ value: depositAmount });

      await expect(
        saveEther.connect(otherAccount).withdraw()
      ).to.be.revertedWith("you don't have any savings");
    });
  });

  describe("Savings", function () {
    it("Should be able to check the savings", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      const depositAmount = ethers.parseEther("1");

      await saveEther.deposit({ value: depositAmount });

      const balance = await saveEther.checkSavings(owner.address);

      expect(balance).to.equal(depositAmount);
    });

    it("should be able to check savings from another account", async function () {
      const { owner, otherAccount, saveEther } = await loadFixture(
        deploySaveEther
      );

      const depositAmount = ethers.parseEther("1");

      await saveEther.deposit({ value: depositAmount });

      const balance = await saveEther
        .connect(otherAccount)
        .checkSavings(owner.address);

      expect(balance).to.equal(depositAmount);
    });

    it("total savings and saved amount must be the same", async function () {
      const { owner, otherAccount, saveEther } = await loadFixture(
        deploySaveEther
      );

      const depositAmount = ethers.parseEther("1");
      const secondDepositAmount = ethers.parseEther("2");

      await saveEther.deposit({ value: depositAmount });

      await saveEther
        .connect(otherAccount)
        .deposit({ value: secondDepositAmount });

      const balance = await saveEther.checkContractBal();

      const totalSavings = depositAmount + secondDepositAmount;

      expect(balance).to.equal(totalSavings);
    });

    it("should be able to send out ", async function () {
      const { owner, otherAccount, saveEther } = await loadFixture(
        deploySaveEther
      );

      const depositAmount = ethers.parseEther("2");

      await saveEther.deposit({ value: depositAmount });

      let balanceOFOwner = await saveEther.checkSavings(owner.address);

      const sendOutAmount = ethers.parseEther("1");

      await saveEther.sendOutSaving(otherAccount.address, sendOutAmount);

      balanceOFOwner = await saveEther.checkSavings(owner.address);


      expect(balanceOFOwner).to.equal(sendOutAmount);
    });
  });

  describe("Events", function () {
    it("Should emit a SavingSuccessful event", async function () {
      const { owner, saveEther } = await loadFixture(deploySaveEther);

      const depositAmount = ethers.parseEther("1");

      await expect(saveEther.deposit({ value: depositAmount }))
        .to.emit(saveEther, "SavingSuccessful")
        .withArgs(owner.address, depositAmount);
    });
  });
});
