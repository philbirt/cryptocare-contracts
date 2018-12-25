#!/usr/bin/ruby

require 'json'

CONTRACT_CONFIG = [
  {
    input_path: "./build/contracts/CryptoCareMinter.json",
    frontend_output_path: "../frontend/src/stores/config-minter-contract.json",
    node_output_path: "../node-backend/config/config-minter-contract.json"
  },
  {
    input_path: "./build/contracts/CryptoCareToken.json",
    frontend_output_path: "../frontend/src/stores/config-token-contract.json",
    node_output_path: "../node-backend/config/config-token-contract.json"
  },
]

BLUEPRINT_PATH = "#{File.dirname(__FILE__)}/blueprint.json"

CONTRACT_CONFIG.each do |config|
  blueprint_json = JSON.parse(File.open(BLUEPRINT_PATH, "r").read)
  contract_json = JSON.parse(File.open(config[:input_path], "r").read)

  blueprint_json['contractAbi'] = contract_json['abi']

  contract_json['networks'].each do |network_key, network_data|
    blueprint_json['networks'][network_key]["contractAddress"] = network_data["address"]
  end

  File.open(config[:frontend_output_path], "w") do |f|     
    f.write(JSON.pretty_generate(blueprint_json))   
  end

  File.open(config[:node_output_path], "w") do |f|     
    f.write(JSON.pretty_generate(blueprint_json))   
  end
end
