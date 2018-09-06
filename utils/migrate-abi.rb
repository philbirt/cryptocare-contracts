#!/usr/bin/ruby

require 'json'

BLUEPRINT_PATH = "#{File.dirname(__FILE__)}/blueprint.json"
INPUT_PATH =  "./build/contracts/CryptoCare.json"

FRONTEND_OUTPUT_PATH = "../frontend/src/stores/config-contract.json"
NODE_OUTPUT_PATH = "../node-backend/config/contract-config.json"

blueprint_json = JSON.parse(File.open(BLUEPRINT_PATH, "r").read)
contract_json = JSON.parse(File.open(INPUT_PATH, "r").read)

blueprint_json['contractAbi'] = contract_json['abi']

contract_json['networks'].each do |network_key, network_data|
  blueprint_json['networks'][network_key]["contractAddress"] = network_data["address"]
end

File.open(FRONTEND_OUTPUT_PATH, "w") do |f|     
  f.write(JSON.pretty_generate(blueprint_json))   
end

File.open(NODE_OUTPUT_PATH, "w") do |f|     
  f.write(JSON.pretty_generate(blueprint_json))   
end
