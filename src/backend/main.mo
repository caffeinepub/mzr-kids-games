import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

actor {
  type Score = {
    gameName : Text;
    score : Nat;
  };

  module Score {
    public func compare(score1 : Score, score2 : Score) : Order.Order {
      switch (Text.compare(score1.gameName, score2.gameName)) {
        case (#equal) { Nat.compare(score1.score, score2.score) };
        case (order) { order };
      };
    };

    public func compareByValue(score1 : Score, score2 : Score) : Order.Order {
      Nat.compare(score1.score, score2.score);
    };
  };

  let scoreStore = Map.empty<Text, [Score]>();

  // Save a new high score
  public shared ({ caller }) func saveScore(gameName : Text, score : Nat) : async () {
    let newEntry : Score = {
      gameName;
      score;
    };
    let existingScores = switch (scoreStore.get(gameName)) {
      case (null) { [] };
      case (?entries) { entries };
    };
    let updatedScores = existingScores.concat([newEntry]);
    scoreStore.add(gameName, updatedScores);
  };

  // Get high scores for a specific game
  public query ({ caller }) func getTopScores(gameName : Text) : async [Score] {
    let gameScores = switch (scoreStore.get(gameName)) {
      case (null) { Runtime.trap("Game does not exist") };
      case (?scores) { scores };
    };
    gameScores.sort(Score.compareByValue);
  };
};
