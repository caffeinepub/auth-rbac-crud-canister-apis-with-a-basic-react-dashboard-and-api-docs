import Map "mo:core/Map";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  // Initialize the user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Priority = {
    #low;
    #medium;
    #high;
  };

  public type Task = {
    id : Text;
    owner : Principal;
    title : Text;
    description : Text;
    completed : Bool;
    priority : Priority;
    dueDate : ?Time.Time;
    tags : [Text];
  };

  let tasks = Map.empty<Text, Task>();

  public shared ({ caller }) func createTask(id : Text, title : Text, description : Text, priority : Priority, dueDate : ?Time.Time, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create tasks");
    };

    if (tasks.containsKey(id)) {
      Runtime.trap("Task with this ID already exists");
    };

    let task : Task = {
      id;
      owner = caller;
      title;
      description;
      completed = false;
      priority;
      dueDate;
      tags;
    };
    tasks.add(id, task);
  };

  public query ({ caller }) func getTask(id : Text) : async Task {
    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (caller != task.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only task owner or admins can view tasks");
        };
        task;
      };
    };
  };

  public shared ({ caller }) func updateTask(id : Text, title : Text, description : Text, completed : Bool, priority : Priority, dueDate : ?Time.Time, tags : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (caller != task.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only task owner or admins can update tasks");
        };

        let updatedTask : Task = {
          id;
          owner = task.owner;
          title;
          description;
          completed;
          priority;
          dueDate;
          tags;
        };
        tasks.add(id, updatedTask);
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };

    switch (tasks.get(id)) {
      case (null) { Runtime.trap("Task not found") };
      case (?task) {
        if (caller != task.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only task owner or admins can delete tasks");
        };
        tasks.remove(id);
      };
    };
  };

  public query ({ caller }) func listTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list tasks");
    };

    let filteredTasks = tasks.values().toArray().filter(
      func(task) {
        task.owner == caller or AccessControl.isAdmin(accessControlState, caller);
      }
    );

    filteredTasks;
  };

  public query ({ caller }) func listFilteredTasks(showCompleted : Bool, tagFilter : ?Text) : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list tasks");
    };

    let filtered = tasks.values().toArray().filter(
      func(task) {
        ((task.owner == caller or AccessControl.isAdmin(accessControlState, caller)) and task.completed == showCompleted);
      }
    );

    let taggedFiltered = switch (tagFilter) {
      case (null) { filtered };
      case (?tag) {
        filtered.filter(
          func(task) {
            task.tags.find(
              func(t) {
                t == tag;
              }
            ) != null;
          }
        );
      };
    };

    taggedFiltered;
  };
};

