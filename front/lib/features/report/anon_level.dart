enum AnonLevel { none, partial, full }

extension AnonLevelLabel on AnonLevel {
  String get label {
    switch (this) {
      case AnonLevel.none:
        return 'Identité visible';
      case AnonLevel.partial:
        return 'Semi-anonyme';
      case AnonLevel.full:
        return 'Anonyme à 100%';
    }
  }
}
