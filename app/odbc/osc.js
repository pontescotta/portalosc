var pg 		 = require('pg'),
	async 	 = require('async'),
	pgParams = rootRequire('./config/secret').dbPostgres,
	con 	 = 'postgres://' + pgParams.user + ':' + pgParams.password + '@' + pgParams.host + '/' + pgParams.name;

var dbClient;
var dbDone;
var dbResult;

function connect(callback){
	pg.connect(con, function(err, client, done){
		dbClient = client;
		dbDone = done;
		callback(err);
	});
}

function disconnect(){
	dbDone();
	dbClient = null;
	dbDone = null;
}

function getOSC(id, callback){
	var dbResult = {};
	var values = [id];
	async.series([
	    connect,
	    function(callback) {
			var sql = 'SELECT im_imagem AS "logo", bosc_nr_identificacao AS "cnpj", bosc_nm_osc AS "razoSocial", '
					+ 'bosc_nm_fantasia_osc AS "nomeFantasia", dcnj_nm_natureza_juridica AS "naturezaJuridica", '
					+ 'dcsc_nm_subclasse AS "atividadeEconomica", ospr_dt_ano_fundacao AS "anoFundacao", '
					+ 'ospr_ee_site AS "site", ospr_tx_descricao AS "descricao" '
					+ 'FROM portal.vm_osc_principal ' 
					+ 'WHERE bosc_sq_osc = $1::int';			
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {dadosGerais: result.rows[0]});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT a.loca_ds_endereco AS "logradouro", b.edmu_nm_municipio AS "municipio", c.eduf_sg_uf AS "uf" '
					+ 'FROM data.tb_localizacao a '
					+ 'LEFT JOIN spat.ed_municipio b '
					+ 'ON a.edmu_cd_municipio = b.edmu_cd_municipio '
					+ 'LEFT JOIN spat.ed_uf c '
					+ 'ON b.eduf_cd_uf = c.eduf_cd_uf '
					+ 'WHERE a.bosc_sq_osc = $1::int '
					+ 'AND a.mdfd_cd_fonte_dados = 1';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {endereco: result.rows[0]});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT cont_ee_email AS "email" '
	    			+ 'FROM data.tb_contatos '
	    			+ 'WHERE bosc_sq_osc = $1::int '
	    			+ 'AND mdfd_cd_fonte_dados = 1';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {contato: result.rows[0]});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT rais_qt_vinculo_clt AS "clt", rais_qt_vinculo_voluntario AS "voluntarios", rais_qt_vinculo_deficiente AS "deficientes" '
					+ 'FROM data.tb_osc_rais '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {vinculos: result.rows[0]});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT cargo AS "cargo", nome AS "nome" '
					+ 'FROM data.tb_osc_diretor '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {dirigentes: result.rows});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT vl_valor_parcerias_federal AS "federal", vl_valor_parcerias_estadual AS "estadual", vl_valor_parcerias_municipal AS "municipal" '
					+ 'FROM portal.vm_osc_principal '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {recursos: result.rows[0], });
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT cons_nm_conselho AS "nomeContato" '
					+ 'FROM data.nm_osc_conselho AS a '
					+ 'INNER JOIN data.tb_conselhos AS b '
					+ 'ON a.cons_cd_conselho = b.cons_cd_conselho '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {conselhos: result.rows});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT titulo AS "titulo", status AS "status", data_inicio AS "dataInicio", data_fim AS "dataFinal", valor_total AS "valorTotal", '
	    			+ 'fonte_recurso AS "fonteRecursos", link AS "link", publico_alvo AS "publicoBeneficiado", abrangencia AS "abrangencia", localizacao AS "localizacao", '
	    			+ 'financiadores AS "financiadores", descricao AS "descricao" '
					+ 'FROM data.tb_osc_projeto '
					+ 'WHERE proj_cd_projeto IN (SELECT proj_cd_projeto FROM data.tb_ternaria_projeto WHERE bosc_sq_osc = $1::int)';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {projetos: result.rows});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT tx_situacao AS "status", dt_inicio_vigencia AS "dataInicio", dt_fim_vigencia AS "dataFinal", vl_global AS "valorTotal", '
	    			+ 'nm_orgao_concedente AS "orgaoConcedente", conv_publico_alvo AS "publicoBeneficiado", abrangencia AS "abrangencia" '
					+ 'FROM data.tb_osc_convenios '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {convenios: result.rows});
				callback(err);
			});
	    },
	    function(callback) {
	    	var sql = 'SELECT cnea_dt_publicacao AS "dataCnea", cebas_mec_dt_inicio_validade AS "dataInicioCebasMec", cebas_mec_dt_fim_validade AS "dataFinalCebasMec", '
	    			+ 'cebas_saude_dt_inicio_validade AS "dataInicioCebasSaude", cebas_saude_dt_fim_validade AS "dataFinalCebasSaude", cnes_oscip_dt_publicacao AS "dataOscip", '
	    			+ 'cnes_upf_dt_declaracao AS "dataUpf", cebas_mds_dt_inicio_validade AS "dataInicioCebasMdf", cebas_mds_dt_fim_validade AS "dataFinalCebasMdf" '
					+ 'FROM data.tb_osc_certificacao '
					+ 'WHERE bosc_sq_osc = $1::int';
			
			dbClient.query(sql, values, function(err, result) {
				Object.assign(dbResult, dbResult, {certificados: result.rows[0]});
				callback(err);
			});
	    }
    ], function(err){
		disconnect();
		
		var privado = null;
		var proprio = null;
		var total = null;
		
		dbResult.projetos.forEach(function(projeto) {
		    if(projeto.fonteRecursos == 'Privado' && projeto.valortotal > -1 && projeto.valortotal != null){
		    	if(privado == null) privado = 0;
				if(total == null) total = 0;
				
		    	privado = privado + projeto.valortotal;
		    	total = recursosTotal + projeto.valortotal;
		    }
		    else if(projeto.fonteRecursos == 'Proprio' && projeto.valortotal > -1 && projeto.valortotal != null){
		    	if(proprio == null) proprio = 0;
				if(total == null) total = 0;
				
		    	proprio = proprio + projeto.valortotal;
		    	total = total + projeto.valortotal;
		    }
		    else if(projeto.valortotal > -1 && projeto.valortotal != null){
		    	if(total == null) total = 0;
		    	
		    	total = total + projeto.valortotal;
		    }
		});
		
		dbResult.convenios.forEach(function(convenio) {
			if(convenio.valortotal > -1 && convenio.valortotal != null){
				if(dbResult.recursos.federal == null) dbResult.recursos.federal = 0;
				dbResult.recursos.federal = dbResult.recursos.federal + convenio.valortotal;
				total = total + convenio.valortotal;
			}
		});
		
		Object.assign(dbResult.recursos, dbResult.recursos, {privado: privado});
		Object.assign(dbResult.recursos, dbResult.recursos, {proprio: proprio});
		Object.assign(dbResult.recursos, dbResult.recursos, {total: total});
		
		callback(dbResult);
	});
};

function updateOSC(osc, callback){
	pg.connect(con, function(error, client, done) {
		if(error) {
			console.error('error fetching client from pool', error);
			callback(true);
		}
		
		var sql = 'UPDATE portal.vm_osc_principal SET ' +
			  	  'bosc_nm_fantasia_osc = $1::text,' +
			  	  'ospr_tx_descricao = $2::text,' +
			  	  'ospr_dt_ano_fundacao = $3::int, ' +
			  	  'ospr_ee_site = $4::text, ' +
			  	  'ee_google = $5::text, ' +
			  	  'ee_facebook = $6::text, ' +
			  	  'ee_linkedin = $7::text, ' +
			  	  'ee_twitter = $8::text, ' +
			  	  'WHERE bosc_sq_osc = $9::int';
		
		var values = [osc.nome_fantasia, osc.descricao, osc.ano_fundacao, osc.site, osc.google, osc.facebook, osc.linkedin, osc.twitter, osc.id];
		
		client.query(sql, values, function(error, result) {
			done();
			if(error) {
				console.error('error running query', error);
				callback(true);
			}
			callback(false);
		});
	});
};

module.exports = {  
	getOSC: getOSC,
	updateOSC: updateOSC
}