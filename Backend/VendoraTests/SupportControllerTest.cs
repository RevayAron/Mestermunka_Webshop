using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VendoraAPI.Controllers;
using VendoraAPI.Data;
using VendoraAPI.DTOs;
using VendoraAPI.Model;
using Xunit;

namespace VendoraTests
{
    public class SupportControllerTest
    {
        private ApplicationDbContext GetDatabaseContext()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            var dbContext = new ApplicationDbContext(options);
            dbContext.Database.EnsureCreated();
            return dbContext;
        }

        #region GetFaq Tesztek
        [Fact]
        public async Task GetFaq_CsakMegvalaszoltKereseketAdjaVissza()
        {
            var db = GetDatabaseContext();

            // Létrehozunk egy megválaszolt és egy még függőben lévő kérdést
            db.SupportTickets.Add(new SupportTicket { Id = 1, Question = "Hol a csomagom?", Status = "Pending", CreatedAt = DateTime.UtcNow });
            db.SupportTickets.Add(new SupportTicket { Id = 2, Question = "Mennyi a szállítás?", Answer = "1500 Ft", Status = "Answered", CreatedAt = DateTime.UtcNow });
            await db.SaveChangesAsync();

            var controller = new SupportController(db);

            var result = await controller.GetFaq();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var faqs = Assert.IsType<List<SupportTicket>>(okResult.Value);

            Assert.Single(faqs); // Csak 1-et szabad visszaadnia
            Assert.Equal(2, faqs.First().Id); // Annak is a 2-es Id-júnak kell lennie
        }
        #endregion

        #region AskQuestion Tesztek
        [Fact]
        public async Task AskQuestion_SikeresBekuldes_PendingStatuszbaKerul()
        {
            var db = GetDatabaseContext();
            var controller = new SupportController(db);
            var dto = new SupportQuestionDTO { Question = "Hogyan tudok visszatéríteni?" };

            var result = await controller.AskQuestion(dto);

            Assert.IsType<OkObjectResult>(result);
            var ticket = await db.SupportTickets.FirstAsync();

            Assert.Equal("Hogyan tudok visszatéríteni?", ticket.Question);
            Assert.Equal("Pending", ticket.Status);
        }

        [Fact]
        public async Task AskQuestion_Hiba_UresAQuestionMezo()
        {
            var db = GetDatabaseContext();
            var controller = new SupportController(db);
            var dto = new SupportQuestionDTO { Question = "    " };

            var result = await controller.AskQuestion(dto);

            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
        }
        #endregion

        #region GetAllTickets Tesztek
        [Fact]
        public async Task GetAllTickets_MindenKerdestVisszaad()
        {
            var db = GetDatabaseContext();
            db.SupportTickets.Add(new SupportTicket { Id = 1, Question = "Kérdés 1", Status = "Pending" });
            db.SupportTickets.Add(new SupportTicket { Id = 2, Question = "Kérdés 2", Status = "Answered" });
            await db.SaveChangesAsync();

            var controller = new SupportController(db);

            var result = await controller.GetAllTickets();

            var okResult = Assert.IsType<OkObjectResult>(result);
            var tickets = Assert.IsType<List<SupportTicket>>(okResult.Value);

            Assert.Equal(2, tickets.Count);
        }
        #endregion

        #region AnswerTicket Tesztek
        [Fact]
        public async Task AnswerTicket_SikeresValaszadas_StatuszFrissul()
        {
            var db = GetDatabaseContext();
            db.SupportTickets.Add(new SupportTicket { Id = 1, Question = "Függő kérdés", Status = "Pending" });
            await db.SaveChangesAsync();

            var controller = new SupportController(db);
            var dto = new SupportAnswerDTO { Answer = "Itt a válasz!" };

            var result = await controller.AnswerTicket(1, dto);

            Assert.IsType<OkObjectResult>(result);
            var ticket = await db.SupportTickets.FindAsync(1);

            Assert.Equal("Itt a válasz!", ticket.Answer);
            Assert.Equal("Answered", ticket.Status);
        }

        [Fact]
        public async Task AnswerTicket_Hiba_RosszId()
        {
            var db = GetDatabaseContext();
            var controller = new SupportController(db);
            var dto = new SupportAnswerDTO { Answer = "Válasz a semmibe" };

            var result = await controller.AnswerTicket(999, dto);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Kérdés nem található.", notFound.Value);
        }
        #endregion

        #region DeleteTicket Tesztek
        [Fact]
        public async Task DeleteTicket_SikeresTorles()
        {
            var db = GetDatabaseContext();
            db.SupportTickets.Add(new SupportTicket { Id = 1, Question = "Rossz kérdés", Status = "Pending" });
            await db.SaveChangesAsync();

            var controller = new SupportController(db);

            var result = await controller.DeleteTicket(1);

            Assert.IsType<OkObjectResult>(result);
            Assert.Empty(db.SupportTickets);
        }

        [Fact]
        public async Task DeleteTicket_Hiba_RosszId()
        {
            var db = GetDatabaseContext();
            var controller = new SupportController(db);

            var result = await controller.DeleteTicket(999);

            var notFound = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal("Kérdés nem található.", notFound.Value);
        }
        #endregion
    }
}