import { expect } from "chai";
import { ethers } from "hardhat";
import { LLMPlatformToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("LLMPlatformToken", function () {
    let token: LLMPlatformToken;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const LLMPlatformToken = await ethers.getContractFactory("LLMPlatformToken");
        token = await LLMPlatformToken.deploy();
        await token.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("Should assign the initial supply to the owner", async function () {
            const ownerBalance = await token.balanceOf(owner.address);
            expect(await token.totalSupply()).to.equal(ownerBalance);
        });

        it("Should have correct name and symbol", async function () {
            expect(await token.name()).to.equal("LLM Platform Token");
            expect(await token.symbol()).to.equal("LLMP");
        });

        it("Should have correct initial supply", async function () {
            const expectedSupply = ethers.parseEther("1000000000"); // 1 billion
            expect(await token.totalSupply()).to.equal(expectedSupply);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = ethers.parseEther("1000");
            await token.mint(addr1.address, mintAmount);

            expect(await token.balanceOf(addr1.address)).to.equal(mintAmount);
        });

        it("Should not allow minting beyond max supply", async function () {
            const maxSupply = ethers.parseEther("10000000000"); // 10 billion
            const currentSupply = await token.totalSupply();
            const excessAmount = maxSupply - currentSupply + ethers.parseEther("1");

            await expect(
                token.mint(addr1.address, excessAmount)
            ).to.be.revertedWith("Would exceed max supply");
        });

        it("Should not allow non-owner to mint", async function () {
            const mintAmount = ethers.parseEther("1000");

            await expect(
                token.connect(addr1).mint(addr2.address, mintAmount)
            ).to.be.reverted;
        });

        it("Should emit TokensMinted event", async function () {
            const mintAmount = ethers.parseEther("1000");

            await expect(token.mint(addr1.address, mintAmount))
                .to.emit(token, "TokensMinted")
                .withArgs(addr1.address, mintAmount);
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            // Transfer some tokens to addr1
            await token.transfer(addr1.address, ethers.parseEther("1000"));
        });

        it("Should allow users to burn their tokens", async function () {
            const burnAmount = ethers.parseEther("100");
            const initialBalance = await token.balanceOf(addr1.address);

            await token.connect(addr1).burn(burnAmount);

            expect(await token.balanceOf(addr1.address)).to.equal(
                initialBalance - burnAmount
            );
        });

        it("Should decrease total supply when burning", async function () {
            const burnAmount = ethers.parseEther("100");
            const initialSupply = await token.totalSupply();

            await token.connect(addr1).burn(burnAmount);

            expect(await token.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should emit TokensBurned event", async function () {
            const burnAmount = ethers.parseEther("100");

            await expect(token.connect(addr1).burn(burnAmount))
                .to.emit(token, "TokensBurned")
                .withArgs(addr1.address, burnAmount);
        });
    });

    describe("Transfers", function () {
        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.parseEther("50");

            await token.transfer(addr1.address, transferAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(transferAmount);

            await token.connect(addr1).transfer(addr2.address, transferAmount);
            expect(await token.balanceOf(addr2.address)).to.equal(transferAmount);
            expect(await token.balanceOf(addr1.address)).to.equal(0);
        });

        it("Should fail if sender doesn't have enough tokens", async function () {
            const initialOwnerBalance = await token.balanceOf(owner.address);

            await expect(
                token.connect(addr1).transfer(owner.address, 1)
            ).to.be.reverted;

            expect(await token.balanceOf(owner.address)).to.equal(initialOwnerBalance);
        });
    });
});
