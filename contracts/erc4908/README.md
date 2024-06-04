# ERC-4908: Gated information NFT access

## Abstract

This standard is an extension of [EIP-721](https://eips.ethereum.org/EIPS/eip-721) that allows for the creation of NFTs that can be used to access gated information. The NFTs are allowed by the information content author to be minted by anyone on chain. The author specifies a mint price and an access expiration time. The NFTs can be transferred to other users, who can then access the information for the remaining time.
The NFT ownership and expiration time is verified on-chain by the contract.

## Motivation

Tailored for the needs of the [Ipal platform](https://app.ipal.network/). The goal is similar to [eip-4907 rentable NFTs](https://eips.ethereum.org/EIPS/eip-4907) but with a radicaly different approach. The emphasis is on the off-chain verification of the contract state for an information management platform to take a decision whether or not to give acces based on user's holdings of its NFTs.
The user keeps the ability to transfer or put on sale the expired NFTs which the value could be drawn from the historical event of having a past access. 

## Specification

### Contract Interface

```solidity
interface IERC4908 {

    /// @notice Allows content access NFT to be minted
    /// @dev This function is meant to be called by the content author
    /// @param resourceId The content identification from the off-chain content service provider
    /// @param price The mint price, in other terms the access price for this particular content
    /// @param expirationTime The expiration time of the access
    function setAccess(uint256 resourceId, uint256 price, uint256 expirationTime) external;

    /// @notice Disallows content access NFT to be minted, the remaining NFTs can still be used
    /// @dev This function is meant to be called by the content author
    /// @param resourceId The content identification from the off-chain content service provider
    function delAccess(uint256 resourceId) external;

    /// @notice Mints a content access NFT
    /// @dev This function is meant to be called by the content consumer
    /// @param to The address of the content consumer
    /// @param resourceId The content identification from the off-chain content service provider
    function mint(address to, uint256 resourceId) external;

    /// @notice Check for the access to a particular content from a particular consumer
    /// @dev This function is meant to be called by the content provider, the 2 first parameters
    ///      are meant to certify that the content ID is owned by the author while the last
    ///      `consumer` parameter is used to find if the consumer owns an NFT for this content
    ///      that is not expired.
    /// @param author The address of the content author
    /// @param resourceId The content identification from the off-chain content service provider
    /// @param consumer The address of the content consumer
    /// @return bool True if the consumer has access to the content, false otherwise
    function hasAccess(address author, uint256 resourceId, address consumer) external view returns (bool);
}
```