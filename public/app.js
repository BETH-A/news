$(document).ready(function(){
    $("#srape-new").on("click", function(){
      $.ajax({
        method: "GET",
        url: "/scrape"
      })
        .done(function(data){
          location.reload();
          alert("Added " + data.length + " articles!");
        });
    });

    $(document).on("click", ".save-btn, .del-btn", function(){
      var articleId = $(this).data("id");
      var bool = $(this).data("bool");

      $.ajax({
        method: "PUT",
        url: "/articles/" + articleId + "/" + bool
      })
      .done(function(data){
        console.log(data);

        if(data.saved){
          $("#save-alert").modal('show');
        }
        else{
          location.reload();
        }
      })
    })

    $('#notesModal').on('show.bs.modal', function (event) {
        var modal = $(this);
        var button = $(event.relatedTarget);
        var articleId =  button.data("id");
        var noteList ="";
      $.getJSON("/article/" + articleId, function(data){

        console.log(data);
        console.log("note body" );
        console.log(data.note);
        $("#notes-list").empty();

        if(data.note.length == 0){
          $("#notes-list").html("<li class='list-group-item'>No notes.</li>");
        }
        else{
          for (var i = 0; i < data.note.length; i++){
            var note = "<li class='list-group-item d-flex justify-content-between align-items-center'>"
                + data.note[i].body 
                + "<button class='btn btn-danger btn-sm del-note' data-id='" + data.note[i]._id + "' data-pid='" + articleId + "'>"
                + "&times;</button></li>";
            $("#notes-list").append(note);
          }
        }

        modal.find('#savenote').val(data._id);
      });
    });

    $(document).on("click", "#savenote", function(){
      var articleId = $(this).val();

      if($("#noteinput").val() != null){
        $.ajax({
          method: "POST",
          url: "/article/" + articleId,
          data: {
            body: $("#noteinput").val()
          }
        })
          .done(function(data) {
            console.log(data);
            $('#notesModal').modal('hide');

          });
      }
      $("#noteinput").val("");
    });

    $(document).on("click", ".del-note", function(){
        var noteId = $(this).data("id");
        var articleId = $(this).data("pid");

        $.ajax({
            method:"DELETE",
            url: "/note/" + noteId + "/" + articleId
        })
        .done(function(data){
             $('#notesModal').modal('hide');
        })
    })
})