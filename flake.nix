{
  description = "texthooker-ui";

  inputs = {
    nixpkgs.url = "nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        name = "texthooker-ui";
        src = ./.;
        pkgs = import nixpkgs {inherit system;};
        nativeBuildInputs = with pkgs; [bun];
      in {
        # index.html will be located in the nix store
        # build with "nix build . --print-out-paths" to get the path
        packages.default = pkgs.stdenv.mkDerivation (finalAttrs: {
          inherit name nativeBuildInputs src;
          pname = name;

          installPhase = ''
            bun install --frozen-lockfile
            bun run build
            cp -r ./docs $out
          '';
        });

        devShell = pkgs.mkShell {
          inherit nativeBuildInputs;
        };
      }
    );
}
