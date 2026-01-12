import { expect } from "chai";
import { ethers } from "hardhat";
import { LLMPlatformToken, RevenueSharing } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("RevenueSharing", function () {
    let token: LLMPlatformToken;
    let revenueSharing: RevenueSharing;
    let owner: SignerWithAddress;
    let treasury: SignerWithAddress;
    let creator: SignerWithAddress;
    let user: SignerWithAddress;

    beforeEach(async function () {
        [owner, treasury, creator, user] = await ethers.getSigners();

        // Deploy token
        const LLMPlatformToken = await ethers.getContractFactory("LLMPlatformToken");
        token = await LLMPlatformToken.deploy();
        await token.waitForDeployment();

        // Deploy revenue sharing
        const RevenueSharing = await ethers.getContractFactory("RevenueSharing");
        revenueSharing = await RevenueSharing.deploy(
            await token.getAddress(),
            treasury.address
        );
        await revenueSharing.waitForDeployment();

        // Give user some tokens
        await token.transfer(user.address, ethers.parseEther("10000"));
    });

    describe("Deployment", function () {
        it("Should set the correct platform token", async function () {
            expect(await revenueSharing.platformToken()).to.equal(
                await token.getAddress()
            );
        });

        it("Should set the correct treasury", async function () {
            expect(await revenueSharing.treasury()).to.equal(treasury.address);
        });

        it("Should set default platform fee to 10%", async function () {
            expect(await revenueSharing.platformFeePercent()).to.equal(1000); // 10% in basis points
        });
    });

    describe("Payment Processing", function () {
        it("Should process payment and split correctly", async function () {
            const paymentAmount = ethers.parseEther("100");

            // Approve revenue sharing contract
            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );

            // Process payment
            await revenueSharing.connect(user).processPayment(
                creator.address,
                paymentAmount
            );

            // Check creator earnings (90%)
            const creatorEarnings = await revenueSharing.creatorEarnings(creator.address);
            expect(creatorEarnings).to.equal(ethers.parseEther("90"));

            // Check treasury received platform fee (10%)
            const treasuryBalance = await token.balanceOf(treasury.address);
            expect(treasuryBalance).to.equal(ethers.parseEther("10"));
        });

        it("Should emit PaymentProcessed event", async function () {
            const paymentAmount = ethers.parseEther("100");

            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );

            await expect(
                revenueSharing.connect(user).processPayment(creator.address, paymentAmount)
            )
                .to.emit(revenueSharing, "PaymentProcessed")
                .withArgs(
                    user.address,
                    creator.address,
                    paymentAmount,
                    ethers.parseEther("90"),
                    ethers.parseEther("10")
                );
        });

        it("Should fail if user hasn't approved tokens", async function () {
            const paymentAmount = ethers.parseEther("100");

            await expect(
                revenueSharing.connect(user).processPayment(creator.address, paymentAmount)
            ).to.be.reverted;
        });

        it("Should fail with invalid creator address", async function () {
            const paymentAmount = ethers.parseEther("100");

            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );

            await expect(
                revenueSharing.connect(user).processPayment(
                    ethers.ZeroAddress,
                    paymentAmount
                )
            ).to.be.revertedWith("Invalid creator address");
        });
    });

    describe("Creator Withdrawals", function () {
        beforeEach(async function () {
            // Process a payment to give creator some earnings
            const paymentAmount = ethers.parseEther("100");
            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );
            await revenueSharing.connect(user).processPayment(
                creator.address,
                paymentAmount
            );
        });

        it("Should allow creator to withdraw earnings", async function () {
            const initialBalance = await token.balanceOf(creator.address);

            await revenueSharing.connect(creator).withdrawEarnings();

            const finalBalance = await token.balanceOf(creator.address);
            expect(finalBalance - initialBalance).to.equal(ethers.parseEther("90"));
        });

        it("Should update withdrawn amount", async function () {
            await revenueSharing.connect(creator).withdrawEarnings();

            const withdrawn = await revenueSharing.creatorWithdrawn(creator.address);
            expect(withdrawn).to.equal(ethers.parseEther("90"));
        });

        it("Should emit CreatorWithdrawal event", async function () {
            await expect(revenueSharing.connect(creator).withdrawEarnings())
                .to.emit(revenueSharing, "CreatorWithdrawal")
                .withArgs(creator.address, ethers.parseEther("90"));
        });

        it("Should fail if no earnings available", async function () {
            await revenueSharing.connect(creator).withdrawEarnings();

            await expect(
                revenueSharing.connect(creator).withdrawEarnings()
            ).to.be.revertedWith("No earnings to withdraw");
        });
    });

    describe("Platform Fee Management", function () {
        it("Should allow owner to update platform fee", async function () {
            await revenueSharing.setPlatformFee(2000); // 20%
            expect(await revenueSharing.platformFeePercent()).to.equal(2000);
        });

        it("Should not allow fee above maximum", async function () {
            await expect(
                revenueSharing.setPlatformFee(3001) // 30.01%
            ).to.be.revertedWith("Fee too high");
        });

        it("Should not allow non-owner to update fee", async function () {
            await expect(
                revenueSharing.connect(user).setPlatformFee(2000)
            ).to.be.reverted;
        });

        it("Should emit PlatformFeeUpdated event", async function () {
            await expect(revenueSharing.setPlatformFee(2000))
                .to.emit(revenueSharing, "PlatformFeeUpdated")
                .withArgs(2000);
        });
    });

    describe("Treasury Management", function () {
        it("Should allow owner to update treasury", async function () {
            await revenueSharing.setTreasury(user.address);
            expect(await revenueSharing.treasury()).to.equal(user.address);
        });

        it("Should not allow invalid treasury address", async function () {
            await expect(
                revenueSharing.setTreasury(ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid treasury address");
        });

        it("Should emit TreasuryUpdated event", async function () {
            await expect(revenueSharing.setTreasury(user.address))
                .to.emit(revenueSharing, "TreasuryUpdated")
                .withArgs(user.address);
        });
    });

    describe("Available Earnings", function () {
        it("Should return correct available earnings", async function () {
            const paymentAmount = ethers.parseEther("100");
            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );
            await revenueSharing.connect(user).processPayment(
                creator.address,
                paymentAmount
            );

            const available = await revenueSharing.getAvailableEarnings(creator.address);
            expect(available).to.equal(ethers.parseEther("90"));
        });

        it("Should return zero after withdrawal", async function () {
            const paymentAmount = ethers.parseEther("100");
            await token.connect(user).approve(
                await revenueSharing.getAddress(),
                paymentAmount
            );
            await revenueSharing.connect(user).processPayment(
                creator.address,
                paymentAmount
            );

            await revenueSharing.connect(creator).withdrawEarnings();

            const available = await revenueSharing.getAvailableEarnings(creator.address);
            expect(available).to.equal(0);
        });
    });
});
