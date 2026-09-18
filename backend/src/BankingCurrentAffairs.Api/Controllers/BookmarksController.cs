using BankingCurrentAffairs.Core.DTOs;
using BankingCurrentAffairs.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BankingCurrentAffairs.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookmarksController : ControllerBase
{
    private readonly IBookmarkService _service;

    public BookmarksController(IBookmarkService service)
    {
        _service = service;
    }

    [HttpGet("user/{userId}")]
    [ProducesResponseType(typeof(List<BookmarkResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetUserBookmarks(string userId)
    {
        var bookmarks = await _service.GetUserBookmarksAsync(userId);
        return Ok(bookmarks);
    }

    [HttpPost("toggle")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> ToggleBookmark([FromBody] BookmarkDto dto)
    {
        if (dto.ItemId == Guid.Empty || string.IsNullOrWhiteSpace(dto.UserId))
        {
            return BadRequest(new { message = "ItemId and UserId are required." });
        }

        var isBookmarked = await _service.ToggleBookmarkAsync(dto.ItemId, dto.UserId, dto.Note);
        return Ok(new { isBookmarked, message = isBookmarked ? "Item bookmarked successfully." : "Bookmark removed." });
    }

    [HttpDelete("item/{itemId:guid}/user/{userId}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> DeleteBookmark(Guid itemId, string userId)
    {
        var removed = await _service.DeleteBookmarkAsync(itemId, userId);
        return Ok(new { success = removed });
    }
}
